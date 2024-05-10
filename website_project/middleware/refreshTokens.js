const jwt = require('jsonwebtoken'); // import the module jsonwebtoken which give the ability to sign, verify, decode and etc jwt tokens
const spawn = require('child_process').spawn; // import module child_process.spawn can spawns a new process with the given command with parameters that will be in args
const path = require('path'); // Importing module path - allow to work with directories
require('dotenv').config(); // gets all environment variables from .env file
const createAuthTokens = require('../create_auth_tokens'); // import the functions from the file create_auth_tokens

// function input is the data that needs to be passed to the python file and the filename of the python file that needs to execute
function pythonScript(data, filename){
    return new Promise((resolve, reject) => { // return a promise(because the python file runs asynchronous returning promise with resolve that holds the data printed as output in the python file)
        spawn('python', [path.join(__dirname + "/../python/" + filename).toString(), JSON.stringify(data)]).stdout.on('data', (data) => { // call the spawn and pass the location and the name of the file the command looks like this(python project_directory/python/file_name) the other one is the data passed as string of json. after that using stdout.on('data', data) gets the printed data of the python file 
            resolve(data.toString().replace(/[\r\n]+/gm, "")); // removes all the breaklines on multiple lines and more that once(global)
        });
    });
}

// function input is request, response and next
module.exports = async(req, res, next) => { // asyc function in order to use await
    accessToken = req.cookies['access-token']; // gets the value of cookie named access-token
    refreshToken = req.cookies['refresh-token']; // gets the value of cookie named refresh-token
    if((!accessToken || typeof accessToken === 'undefined' || accessToken === null) && (!refreshToken || typeof refreshToken === 'undefined' || refreshToken === null)){ // if both of them are empty or not existed
        return res.sendStatus(401); // return response with status 401(unauthorized)
    }

    try{
        const accessTokenDecoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET); // try to verify the access token if failed the code continues but if succeeded the code in the try will run
        req.userId = accessTokenDecoded.user_id; // set the req.userId to the user_id that is written in the verified access token
        return next(); // return next - meaning that this middleware is finished and the express app will continue to the next one
    }catch{}


    if(!refreshToken){ // if refresh token is not existing
        return res.sendStatus(401); // return response with status 401(unauthorized) 
    }


    var refreshTokenDecoded;

    try{
        refreshTokenDecoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); // set variable to decoded refresh token if verifiable
    }catch{
        return res.sendStatus(401); // if token is not varifiable return response with status 401(unauthorized)
    }

    await pythonScript(refreshTokenDecoded.user_id, '/../python/get_all_user_id.py').then(user => { // run the python file named get_all_user_id.py while passing as arguments the user id
        user_info = user // user contain all the data of the user with the user id passed
    });
    //user_info = (user_id, 'email', 'username', "b'hashed_password'", count, user_type, 'reset_link')
    user_info = user_info.split(", "); // split user_info to array based on where the ", " can be found
    user_id = user_info[0].slice(1, user_info[0].length); // before => (user_id || after => user_id
    username = user_info[2].slice(1, -1); // before => 'username' || after => username
    count = user_info[4]; // save the count
    user_type = user_info[5]; // save the user type
    if(!user_info || count !== refreshTokenDecoded.count){ // if user_info is empty or the count in the database is not equal to the one stored in the refresh token
        return res.sendStatus(401); // return response with status 401(unauthorized)
    }
    const tokens = createAuthTokens.createAuthTokens(user_id, username, count, user_type); // create two new tokens with user info: 1 - access token, 2 - refresh token
    res.cookie('access-token', tokens.accessToken, { maxAge: 1000 * 60 * 15, httpOnly: false }); // cookie set to 15 minutes
    res.cookie('refresh-token', tokens.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true }); // cookie set to 7 days
    req.userId = user_id; // saves the user_id in the req.userId
    return next(); // return next - meaning that this middleware is finished and the express app will continue to the next one
}

// invalidate tokens
    // if(!req.userId){
    //     return res.status(401).send("Access Denied");
    // }else{
    //     var user_info;
    //     await pythonScript(req.userId, '/../python/get_all_user_id.py').then(user => {
    //         user_info = user;
    //     });
    //     if(!user_info){
    //         return res.status(401).send("Access Denied");
    //     }
    //     console.log(user_info);
    //     user_info = user_info.substring(1, user_info.length-1).split(", ");
    //     console.log(user_info);
    //     console.log(user_info[0].toString() + "," + (Number(user_info[4]) + 1).toString());
    //     await pythonScript(user_info[0].toString() + "," + (Number(user_info[4]) + 1).toString(), '/../python/add_one_to_user_count_by_id.py').then(data => {
    //         if(data != true){
    //             return res.status(401).send("Access Denied");
    //         }
    //     });
    // }
    // let isTokensValidate;
    // await vlid(req, res).then(isValid => {
    //     isTokensValidate = isValid;
    // });

    // if(!isTokensValidate){
    //     return res.status(401).send("Access Denied");
    // }
