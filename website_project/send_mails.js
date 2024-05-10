require('dotenv').config(); // gets all environment variables from .env file
const nodemailer = require('nodemailer'); // import the module nodemailer(give the ability to send emails)
const sender = "teamjarsender@gmail.com"; // variable of the emails sender

// function input is an email receiver and an activation token(jwt token)
const sendActivationMail = (receiver, activationToken) => {
    
    const transporter = createTransporter(); // call function createTransporter and save the returned value

    const data = { // variable that holds all the data of the email itself
        from: sender, // from - sender email
        to: receiver, // to - the email of the receiver
        subject: "Account Activation", // the subject of the email
        html: ` 
            <h2>Please click on the button below to verify your account</h2>
            <form action="${process.env.BASE_URL}/auth/activate/${activationToken}" method="GET">
                <button type="submit" style="background-color: green; border: none; border-radius: 5px; color: white; font-size: 20px;">Activate Account!</button>
            </form>
        ` // the html that the email contains
    };
    
    const err = sendMail(transporter, data); // run the function that send the email and save the errors in err variable
    
    if(err){ // if err is not empty
        return true; // return true - there were errors
    }else{ // else - if err is empty
        return false; // return false - there were not errors
    }
}


// function input is an email receiver and an reset password token(jwt token)
const resetPasswordMail = (receiver, resetPasswordToken) => {
    
    const transporter = createTransporter(); // call function createTransporter and save the returned value

    const data = { // variable that holds all the data of the email itself
        from: sender, // from - sender email
        to: receiver, // to - the email of the receiver
        subject: "Reset Your Password", // the subject of the email
        html: `
            <h2>Click on the button below to reset your password!</h2>
            <form action="${process.env.BASE_URL}/auth/reset_password/${resetPasswordToken}" method="GET">
                <button type="submit" style="background-color: green; border: none; border-radius: 5px; color: white; font-size: 20px;">Reset Password!</button>
            </form>
        ` // the html that the email contains
    };

    const err = sendMail(transporter, data); // run the function that send the email and save the errors in err variable
    
    if(err){ // if err is not empty
        return true; // return true - there were errors
    }else{ // else - if err is empty
        return false; // return false - there were not errors
    }
}


// returns an object of transporter(needed in order to send emails)
function createTransporter(){
    const transporter = nodemailer.createTransport({ // creates a transporter based on the options below
        host: "smtp.gmail.com", // the host of gmail for sending emails
        port: 465, // the port used to connect to the host
        secure: true, // the connection is being secured by tls
        auth: { // information needed to provide in order to authenticate and send emails from the sender account
            user: sender, // sender user which is his email
            pass: process.env.EMAIL_APP_PASSWORD // password for the application to access the account and send emails with it(saved in environment variable called EMAIL_APP_PASSWORD)
        }
    });
    return transporter; // returns the transporter
}


// function input is a transporter and data (email itself - subject, html content and etc)
function sendMail(transporter, data){
    transporter.sendMail(data, function(err){ // send the email and execute callback function which gets the errors
        return err; // returns errors
    });
}

module.exports = { sendActivationMail: sendActivationMail, resetPasswordMail: resetPasswordMail }; // make it possible to import this module and use the functions that are listed