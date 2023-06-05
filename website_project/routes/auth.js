const router = require('express').Router(); // used to create routes to our express app
const { body, validationResult } = require('express-validator'); // this module is used to validate the credentials entered by the user
const spawn = require('child_process').spawn; // can create a process(used in the pythonScript function)
const createAuthTokens = require('../create_auth_tokens'); // import the functions from the file create_auth_tokens.js
const sendMails = require('../send_mails'); // import functions from send_mails.js
const jwt = require('jsonwebtoken'); // give the ability to use jwt tokens
const path = require('path'); // give the ability to use directories

// can run python scripts with this function
function pythonScript(body, filename){
    return new Promise((resolve, reject) => {
        spawn('python', [path.join(__dirname + "/../python/" + filename).toString(), JSON.stringify(body)]).stdout.on('data', (data) => {
            resolve(data.toString().replace(/[\r\n]+/gm, ""));
        });
    });
}

// route for post to url /register 
router.post('/register', [
    body('email').isEmail(),
    body('password').isLength({ min:6 })
], // checks if the email is an email and if the password is more than 6 characters
(req, res) => {
    const errors = validationResult(req); // the actual check
    if(!errors.isEmpty()){ // if the variable errors is not empty 
        res.send(errors); // send the errors
    }else{ // else - there are no errors
        if(req.body.password == req.body.verifyPassword){ // if these passwords are match
            // pythonScript(req.body, '/../python/sign_up.py').then(
            //     is_user_existing => {
            //         if(is_user_existing == "true"){
            //             res.redirect('/login');
            //         }else{
            //             res.redirect("/sign_up");
            //         }
            // });
            pythonScript({ email: req.body.email, username: req.body.username }, "/../python/check_user_existence.py").then(user_data => {
                var user_details = user_data.split(", "); // user_details => [email, id] || "false" if not exist
                if(user_details == "false"){
                    const body = req.body;
                    const activate_account_token = createAuthTokens.createActivateAccountToken(body.email, body.username, body.password); // create activation token
                    const isErrors = sendMails.sendActivationMail(body.email, activate_account_token); // send activation mail
                    if(isErrors){
                        res.sendStatus(500).end();
                    }else{ // if succeeded
                        res.redirect("/activate_account"); // redirect to /activate_account
                    }
                }else{ // if user is already exists
                    res.redirect("/sign_up");
                }
            });
        }else{
            res.send("Passwords didn't match!");
        }
    }
});

// route for get to url /auth/activate/:activation_token
router.get("/auth/activate/:activation_token", function(req, res, next){
    const { activation_token } = req.params;
    if(activation_token){ // if there is activation token
        jwt.verify(activation_token, process.env.ACTIVATE_ACCOUNT_TOKEN_SECRET, function(err, decodedToken){ // verify it
            if(err){ // if there were any problems 
                res.status(400).send("Incorrect or expired link!");
            }else{ // if there weren't any problems at all
                pythonScript(decodedToken, '/../python/sign_up.py').then( // sign up the new user in the database
                is_user_existing => {
                    if(is_user_existing == "true"){
                        res.redirect('/login');
                    }else{
                        res.redirect("/sign_up");
                    }
                });
            }
        });
    }else{
        res.sendStatus(500);
    }
});


// route for post to url /login
router.post('/login', function(req, res, next){
    pythonScript(req.body, '/../python/sign_in.py').then( // sign in with the given credentials
        user_info => {
            user_info = user_info.split(',');
            if(user_info[0] == "true"){
                const {refreshToken, accessToken} = createAuthTokens.createAuthTokens(user_info[1], user_info[2], user_info[3], user_info[4]);
                //res.json({ accessToken: accessToken, refreshToken: refreshToken })
                res.cookie("refresh-token", refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true }); // create refresh-token cookie
                res.cookie("access-token", accessToken, { maxAge: 1000 * 60 * 15, httpOnly: false }); // create access-token cookie
                res.redirect("/dashboard"); // redirect user to dashboard
            }else{
                // res.send("Invalid creds!");
                res.render(path.join(__dirname + "/../html/login.ejs"), { error_message: 'Error!', counter: 1 });
                //res.redirect('/login');
            }
        }
    );
});


// route for post to url reset_password
router.post("/reset_password", [
    body('username_or_email').isEmail() // check if user inserted an email
], (req, res) => {
    const errors = validationResult(req);
    const emailOrPassword = req.body.username_or_email;
    if(!errors.isEmpty()){
        // username
        pythonScript({ username: emailOrPassword }, "/../python/check_user_existence.py").then(user_data => {
            var user_details = user_data.split(", "); // user_details => [email, id] || "false" if not exist
            if(user_details != "false"){
                const reset_password_token = createAuthTokens.createResetToken(user_details[1], user_details[0]); // create reset token
                const isErrors = sendMails.resetPasswordMail(user_details[0], reset_password_token); // send reset password email
                if(isErrors){
                    res.sendStatus(500).end();
                }else{
                    pythonScript({ user_id: user_details[1], reset_link: reset_password_token, operation: "update" }, "/../python/manage_reset_link.py").then(isUpdated => {
                        if(isUpdated == "true"){
                            res.end("Reset Password Mail Sent, go ahead and check it!");
                        }else{
                            res.sendStatus(500).end();
                        }
                    });
                }
            }else{
                res.sendStatus(400).end();
            }
        });
    }else{
        // email
        pythonScript({ email: emailOrPassword }, "/../python/check_user_existence.py").then(user_data => {
            var user_details = user_data.split(", "); // user_details => [email, id] || "false" if not exist
            if(user_details != "false"){
                const reset_password_token = createAuthTokens.createResetToken(user_details[1], user_details[0]); // create reset token
                const isErrors = sendMails.resetPasswordMail(user_details[0], reset_password_token); // send reset password email
                if(isErrors){
                    res.sendStatus(500).end();
                }else{
                    pythonScript({ user_id: user_details[1], reset_link: reset_password_token, operation: "update" }, "/../python/manage_reset_link.py").then(isUpdated => {
                        if(isUpdated){
                            res.end("Reset Password Mail Sent, go ahead and check it!");
                        }else{
                            res.sendStatus(500).end();
                        }
                    });
                }
            }else{
                res.sendStatus(400).end();
            }
        });
    }
});


// route for get to url /auth/reset_password/:reset_token
router.get("/auth/reset_password/:reset_token", function(req, res, next){
    const { reset_token } = req.params;
    if(reset_token){ // if there is a token
        jwt.verify(reset_token, process.env.RESET_PASSWORD_TOKEN_SECRET, function(err, decoded_token){ // verify the reset token
            if(err){
                res.status(400).send("Incorrect or expired link!");
            }else{
                res.sendFile(path.join(__dirname, "/../html/reset_password_itself.html"));
            }
        });
    }else{
        res.status(500).end();
    }
});


// route for post to url /auth/reset_password/:reset_token
router.post("/auth/reset_password/:reset_token", [
    body('password').isLength({ min:6 }) // checks if password is minimum 6 characters
], function(req, res, next){
    const errors = validationResult(req); // runs the actual check 
    if(!errors.isEmpty()){
        res.send(errors);
    }else{
        if(req.body.password == req.body.verifyPassword){ // if passwords are match
            const { reset_token } = req.params;
            if(reset_token){ // if there is a reset token
                jwt.verify(reset_token, process.env.RESET_PASSWORD_TOKEN_SECRET, function(err, decodedToken){ // verify the reset token
                    if(err){
                        res.status(400).send("Incorrect or expired link!");
                    }else{ // if reset token is verified
                        pythonScript({ user_id: decodedToken.user_id, reset_link: reset_token, operation: "compare" }, "/../python/manage_reset_link.py").then(status => {
                            if(status == "true"){
                                pythonScript({ user_id: decodedToken.user_id, new_password: req.body.password }, '/../python/reset_password.py').then(status => {
                                    if(status == "true"){
                                        pythonScript({ user_id: decodedToken.user_id, reset_link: "", operation: "update" }, '/../python/manage_reset_link.py').then(status => {
                                            if(status == "true"){
                                                res.redirect("/login");
                                            }else{
                                                res.sendStatus(500);
                                            }
                                        });
                                    }else{
                                        res.sendStatus(500);
                                    }
                                });
                            }else{
                                res.status(400).send("Incorrect or expired link!");
                            }
                        });
                    }
                });
            }else{
                res.sendStatus(500).end();
            }
        }else{
            res.send("Passwords didn't match!");
        }
    }
});

module.exports = router;