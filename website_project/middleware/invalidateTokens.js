const path = require('path'); // Importing module path - allow to work with directories
const spawn = require('child_process').spawn; // import module child_process.spawn can spawns a new process with the given command with parameters that will be in args

// function input is the data that needs to be passed to the python file and the filename of the python file that needs to execute
function pythonScript(data, filename){
    return new Promise((resolve, reject) => {
        spawn('python', [path.join(__dirname + "/../python/" + filename).toString(), data]).stdout.on('data', (data) => {
            resolve(data.toString().replace(/[\r\n]+/gm, ""));
        });
    });
}

// function input is request and response
module.exports = async(req, res) => { // asyc function in order to use await
    if(!req.userId){ // if req.userId is empty or undefined
        return res.sendStatus(401); // return response with status 401(unauthorized)
    }else{ // else - if req.userId is known and already set
        let user_info;
        await pythonScript(req.userId, '/../python/get_all_user_id.py').then(user => { // runs the python file named get_all_user_id.py and return(with print) all the information on the user from the database
            user_info = user; // save the information in variable called user_info
        });
        if(!user_info){ // if user_info is empty
            return res.sendStatus(403); // return response with status 403(forbidden)
        }
        //user_info = (user_id, 'email', 'username', "b'hashed_password'", count, user_type, 'reset_link')
        user_info = user_info.substring(1, user_info.length-1).split(", "); // delete the first and the last characters in the string and split it to an array where ", "
        await pythonScript(user_info[0].toString() + "," + (Number(user_info[4]) + 1).toString(), '/../python/add_one_to_user_count_by_id.py').then(data => { // run python file called add_one_to_user_count_by_id.py and pass the user id and the current count + 1
            if(data == "true"){ // if data is equal to string "true"
                res.clearCookie('access-token'); // remove the cookie named access-token 
                res.clearCookie('refresh-token'); // remove the cookie named refresh-token
                res.redirect('http://localhost:8080/login'); // redirect to the url that is written
            }else{ // else - if data is not equal to string "true"
                return res.sendStatus(500); // return response with status 500(internal server error)
            }
        });
    }
}
