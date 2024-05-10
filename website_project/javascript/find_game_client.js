const game_socket = io("http://localhost:5555/");
const token = getCookie('access-token');
let user_info = atob(token.split(".")[1]);
user_info = user_info.split(',');
let username = user_info[1].split(":")[1];
username = username.substring(1, username.length - 1);


var room_char;
var howMany = 0;
var timer;
// var start;
// checkIfAlreadyOpen();

// when game socket on the server emits to the user the event "timer" which start an interval that runs every second the countTimer function
game_socket.on('timer', () => {
    // runIfNotOpen(function(){
    //     timer = setInterval(countTimer, 1000);
    // });
    timer = setInterval(countTimer, 1000);
    howMany += 1;
});

// when the game socket on the server emits to the user the event "found-game" it will clear the interval of the timer, clear the startTime from the local storage and emit to the game socket server event called "load-game"
game_socket.on('found-game', () => {
    clearInterval(timer);
    localStorage.removeItem('startTime');
    game_socket.emit("load-game");
});

// runs when game socket emit to the user set-room-char (remove the previous chars and set the new ones), after it the user is going to redirect to the game
game_socket.on('set-room-char', (chars) => {
    $.get("/remove_game_chars", function(){
        $.when(post_chars(chars)).done(function(){
            window.location.replace("http://localhost:8080/game");
        });
    });
    
    // window.location.replace("http://localhost:8080/game");
});

// post to the main routes of the server to url /ggpc with the chars as json
function post_chars(chars){
    return $.post("/ggpc", {
        gc: chars.gc,
        pc: chars.pc,
    });
}

// game_socket.on('get-room-char', char => {
//     room_char = char;
// });
// game_socket.on('get-room-char', char => {
//     room_char = char;
// });

// when the game socket emits to the user this event it will remove the startTime frmo localStorage and redirect him to the dashboard
game_socket.on('user-disconnected', () => {
    localStorage.removeItem('startTime');
    window.localtion.replace("http://localhost:8080/dashboard");
});

// before the window is closed it will emit to the game server to remove the user from the waiting list
window.onbeforeunload = function(){
    game_socket.emit("remove-from-waiting-list", username);
}


// this function is running the timer
function countTimer(){
    var totalSeconds = localStorage.getItem('startTime');
    // var totalSeconds = Math.floor((Date.now() - start) / 1000);
    if(!totalSeconds){
        totalSeconds = 0;
    }
    var hours = Math.floor(totalSeconds / 3600); // count the hours
    var minutes = Math.floor((totalSeconds - hours * 3600) / 60)// count the minutes
    var seconds = totalSeconds - (hours * 3600 + minutes * 60)// count the seconds
    totalSeconds = parseInt(totalSeconds) + 1;// add one second to the timer
    localStorage.setItem("startTime", totalSeconds);
    // localStorage.removeItem("startTime");
    document.getElementById("hours").innerHTML = hours;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("seconds").innerHTML = seconds; 
}

// emits to the server the username of the user
function sendUsername(){
    game_socket.emit('get-username', username);
    // checkIfAlreadyOpen();
}


// function runIfNotOpen(func){
//     if(!isOpen){
//         func();
//     }
// }


// function checkIfAlreadyOpen(){
//     localStorage.setItem("open-pages", Date.now());

//     var onLocalStorageEvent = function(e){
//         if(e.key == "open-pages"){
//             localStorage.setItem("page-available", Date.now());
//             isOpen = false;
//         }

//         if(e.key == "page-available", Date.now()){
//             isOpen = true;
//             localStorage.removeItem("page-available");
//         }
//     }
//     window.addEventListener("storage", onLocalStorageEvent);
// }


// function getTime(isOpen){
//     if(!isOpen){
//         return Date.now();
//     }
// }

// can get calue of all the cookies that are not set to httpOnly
function getCookie(cookie_name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookie_name}=`);
    if(parts.length === 2){
        return parts.pop().split(';').shift();
    }else{
        return "";
    }
}

// function setCookie(cookie_name, value, days){
//     var expires = "";
//     if(days){
//         var date = new Date();
//         date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//         expires = "; expires=" + date.toUTCString();
//     }
//     document.cookie = cookie_name + "=" + (value || "") + expires + "; path=/";
// }

// when the window is in focus the timer continues
window.onblur = function(){
    howMany += 1;
    for(var i = 0; i < howMany; i++){
        clearInterval(timer);
    }
    howMany = 0;
}

// when the window is out of focus the timer stop
window.onfocus = function(){
    if(howMany === 0){
        timer = setInterval(countTimer, 1000);
    }
}