// Import all the modules
const router = require('express').Router(); // used to create routes to our express app
const path = require('path'); // give the ability to use directories
const spawn = require('child_process').spawn; // give the ability to start a process
const jwt = require('jsonwebtoken'); // give the ability to use jwt tokens
const fs = require('fs'); // give the ability to make useful actions on files
const refreshTokens = require('../middleware/refreshTokens'); // import the file refreshTokens.js
const imagemin = require("imagemin"); // give the ability to change and optimize an image
const mozjpeg = require("imagemin-mozjpeg"); // give the ability to optimize an image by lowering its quality
const isJpg = require("is-jpg"); // checks if type of image file is a jpg 
const sharp = require("sharp"); // change the image to jpg
const invalidateTokens = require('../middleware/invalidateTokens'); // import functions from the file invalidateTokens
const error_page = "http://localhost:8080/error"; // an error route


// can run a python script(function input is the data that pass to the python file and the name of the python file)
function pythonScript(data, filename){
    return new Promise((resolve, reject) => {
        spawn('python', [path.join(__dirname + "/../python/" + filename).toString(), data]).stdout.on('data', (data) => {
            resolve(data.toString().replace(/[\r\n]+/gm, ""));
        });
    });
}


// function that can serve get requests to certain urls(function input - url and a path to html file)
const getResponse = (url, path) => {
    router.get(url, function(req, res, next){ // if get request is sent to the url, callback function will execute with request, response and next
        if(req.cookies["refresh-token"] == null){ // if the user didn't connect already
            res.sendFile(path); // show the html based on the path of the file
        }else{ // else - if user connected
            res.redirect("/dashboard"); // redirect him to the dashboard
        }
    });
}

// function that can serve get request only to connected user
const protectedGetResponseWithDetails = (url, path) => {
    router.get(url, refreshTokens, function(req, res, next){ // if get request is sent to the url, callback function will execute with request, response and next
        res.sendFile(path); // if the user connected to his account the html will render based on the file that can be found in the path
    });
}

//Regular Get Responses
getResponse("/", path.join(__dirname + "/../html/index.html"));

getResponse("/reset_password", path.join(__dirname + "/../html/reset_password.html"));

getResponse("/activate_account", path.join(__dirname + "/../html/activate_account.html"));

router.get("/login", function(req, res, next){
    if(req.cookies["refresh-token"] == null){ // if user didn't connect
        res.render(path.join(__dirname + "/../html/login.ejs"), { error_message: '', counter: 0 });
    }else{ // else - user connected
        res.redirect("/dashboard");
    }
});

getResponse("/sign_up", path.join(__dirname + "/../html/sign_up.html"));

//Protected Get Routes Using Token To Authenticate
router.get("/dashboard", refreshTokens, function(req, res, next){
    const decoded_refresh = jwt.verify(req.cookies["refresh-token"], process.env.REFRESH_TOKEN_SECRET);
    if(parseInt(decoded_refresh.user_type) === 1){ // if user admin
        res.sendFile(path.join(__dirname, "/../html/admin_dashboard.html")); // render admin dashboard page
    }else{ // else - user is not an admin
        res.sendFile(path.join(__dirname, "/../html/dashboard.html")); // render the regular dashboard
    }
});

router.get("/add_regular_quest", refreshTokens, function(req, res, next){
    const decoded_refresh = jwt.verify(req.cookies["refresh-token"], process.env.REFRESH_TOKEN_SECRET);
    if(parseInt(decoded_refresh.user_type) === 1){
        res.sendFile(path.join(__dirname, "/../html/add_regular_quest.html"));
    }else{
        res.sendStatus(403);
    }
});

// router.get("/add_site_quest", refreshTokens, function(req, res, next){
//     const decoded_refresh = jwt.verify(req.cookies["refresh-token"], process.env.REFRESH_TOKEN_SECRET);
//     if(parseInt(decoded_refresh.user_type) === 1){
//         res.sendFile(path.join(__dirname, "/../html/add_site_quest.html"));
//     }else{
//         res.sendStatus(403);
//     }
// });

//Finding a game
protectedGetResponseWithDetails("/finding-game", path.join(__dirname + "/../html/finding_game.html"));

//game
protectedGetResponseWithDetails("/game", path.join(__dirname + "/../html/game.html"));


//logout
router.post("/logout", refreshTokens, function(req, res, next){
    invalidateTokens(req, res);
});

// get game player chars
router.post("/ggpc", refreshTokens, function(req, res, next){
    if(req.cookies["questClue"] != null){ // if there is a clue
        res.clearCookie('questClue'); // clear the cookie of the clue
    }
    chars = req.body; // get the body (post request sends body with values)
    res.cookie("game-char", chars.gc, { maxAge: 1000 * 60 * 60 * 5, httpOnly:true }); // create a cookie of the game char
    res.cookie("player-char", chars.pc, { maxAge: 1000 * 60 * 60 * 5, httpOnly:true }); // create a cookie of the player char
    res.end(); // ends the response
});

// get the chars (because they set to httpOnly, they accessible only from the server)
router.get("/get-chars", refreshTokens, function(req, res, next){
    game_char = req.cookies['game-char']; // get the value of game char
    player_char = req.cookies['player-char']; // get the value of player char
    res.json({ gc: game_char, pc: player_char }); // sends the values as a json
});

// get a quest
router.post("/get-quest", refreshTokens, function(req, res, next){
    pythonScript(req.body.quest_id, '/../python/get_quest.py').then(quest => { // runs the python script with quest id
        // console.log(quest.question);
        // console.log(quest.clue);
        // console.log(quest.answer);
        // [quest_id, quest, clue, answer, image_name]
        if(quest != "false"){
            quest = quest.substring(1, quest.length-1).split(', ');// make an array where ", " and remove the first and the last characters
            for(var i = 0; i < quest.length; i++){
                // quest[i] = quest[i].replace(/"/g, '');
                if(quest[i].length > 1){
                    quest[i] = quest[i].slice(1, -1);
                }
            }
            quest.splice(2, 2); // removes the clue and the answer from the quest array
            // res.cookie('questId', quest[0], { maxAge: 1000 * 60 * 60 * 24, httpOnly: true })
            res.send(quest);
        }else{
            res.sendStatus(500);
        }
    });
});

// check the answer of the user
router.post("/check_answer", refreshTokens, function(req, res, next){
    pythonScript(JSON.stringify(req.body), "/../python/check_answer.py").then(status => {
        if(status === "true"){
            res.send("right");
        }else{
            res.send("wrong");
        }
    });
});


// create route for url add_quest with get method
router.get("/add_quest", refreshTokens, function(req, res, next){
    const decoded_refresh = jwt.verify(req.cookies["refresh-token"], process.env.REFRESH_TOKEN_SECRET);
    if(parseInt(decoded_refresh.user_type) === 1){ // checks if user is admin
        res.sendFile(path.join(__dirname, "/../html/add_quest.html"));
    }else{
        res.sendStatus(403);
    }
});

// remove the game chars
router.get("/remove_game_chars", refreshTokens, function(req, res, next){
    res.cookie('game-char', { maxAge: 0 });
    res.cookie('player-char', { maxAge: 0 });
    res.clearCookie('game-char');
    res.clearCookie('player-char');
    res.end();
});

// upload an image for quest
router.post("/upload_quest_image", refreshTokens,  function(req, res, next){
    const decoded_refresh = jwt.verify(req.cookies["refresh-token"], process.env.REFRESH_TOKEN_SECRET);
    if(parseInt(decoded_refresh.user_type) === 1){
        // pythonScript([body.imageName, body.imageFile], "/../python/upload_image_dpb.py").then(date => {
        //     console.log(date);
        // });
        var body = req.body;
        var image_type = body.imageType.split('/'); 
        if(image_type[0] === "image" && (image_type[1] === "png" || image_type[1] === "jpeg" || image_type[1] === "gif")){ // if the file is image
            var data = body.imageFile.replace(/^data:image\/\w+;base64,/, ""); // removes "data:image;base64,"
            var buf = Buffer.from(data, 'base64'); // buffer object of the base64 image
            imagemin.buffer(buf, { plugins: [() => { // plugins used on the buffer
                if(isJpg(buf)){ // if image is jpg
                    return buf; // return the buffer
                }else{ // else - if image isn't jpg
                    return sharp(buf).jpeg.toBuffer(); // convert it to jpg
                }
            } , mozjpeg({ quality: 85 })] }).then(miniBuf => { // lower the quality of the image to 85 and run the callback function with the optimized buffer 
                fs.writeFileSync("./images/image.jpg", miniBuf, function(err){ // writing the optimized buffer to file in a synchronous way to file called image.jpg that can be found in folder of images 
                    if(err){ // if there is an error
                        console.log(err); // print it in the console
                    }
                });
            });
            pythonScript(JSON.stringify({ "operation": "upload" , "imageName": body.imageName, "dpbSec": process.env.DPB_SECRET }), "/../python/manage_images_dpb.py").then(status => { // upload the image
                if(status == "true"){ // succeeded
                    res.sendStatus(200); // return success
                }else{ // else - failed
                    res.sendStatus(500); // return failure
                }
            });
        }else{ // file is not an image
            res.sendStatus(500); // return failure
        }
    }else{ // user is not admin
        res.sendStatus(403);
    }
});

// add regular quest(post method to the url add_reguler_quest)
router.post("/add_regular_quest", refreshTokens, function(req, res, next){
    var body = req.body;
    const decoded_refresh = jwt.verify(req.cookies["refresh-token"], process.env.REFRESH_TOKEN_SECRET);
    if(parseInt(decoded_refresh.user_type) === 1){
        pythonScript(JSON.stringify(body), "/../python/add_quest.py").then( status => {
            if(status === "true"){
                res.send("http://localhost:8080/dashboard");
            }else{
                res.send(error_page);
            }
        });
    }else{
        res.sendStatus(403);
    }
});

// an error route
router.get('/error', function(req, res, next){
    res.sendStatus(500);
});

// post to get clue
router.post("/get_clue", refreshTokens, function(req, res, next){
    if(!req.cookies['questClue']){ // if there isn't a clue
        pythonScript(req.body.quest_id, '/../python/get_quest.py').then(quest => {
            // quest => [quest_id, quest, clue, answer, imageName]
            if(quest != "false"){
                quest = quest.substring(1, quest.length-1).split(', ');
                for(var i = 0; i < quest.length; i++){
                    quest[i] = quest[i].replace(/'/g, '');
                }
                res.cookie('questClue', quest[2], { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }); // create cookie of clue
                res.send(quest[2]); // send the clue as a response
            }else{
                res.sendStatus(500);
            }
        });
    }else{ // else - there is a clue
        res.send(req.cookies["questClue"]); // return the clue from the cookie
    }
});

// get an image of quest based on its name
router.post("/get_image", refreshTokens, function(req, res, next){
    var body = req.body;
    if(body != null){
        pythonScript(JSON.stringify({ "operation": "read" , "imageName": body.imageName, "dpbSec": process.env.DPB_SECRET }), "/../python/manage_images_dpb.py").then(status => {
            if(status.split(", ")[0] == "true"){
                res.send(status.split(", ")[1].slice(2, -1));
            }else{
                res.sendStatus(500);
            }
        });
    }else{
        res.sendStatus(500);
    }
});

// get the clue because the client can't access it (httpOnly cookie)
router.get("/get_clue", refreshTokens, function(req, res, next){
    if(req.cookies["questClue"] != null){
        res.send(req.cookies["questClue"]);
    }else{
        res.send(null);
    }
});

// removes the cookie of the clue(questClue)
router.get("/remove_clue", refreshTokens, function(req, res, next){
    res.clearCookie("questClue");
    res.end();
});

// router.get("/get_quest_id", function(req, res, next){
//     res.send(req.cookies["questId"]);
// });

module.exports = router;