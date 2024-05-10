// var game_socket;
// var clientRoom;
// var username;
// function declareVariables(){
//     game_socket = io("http://localhost:5555/");
//     const token = getCookie('access-token');
//     let user_info = atob(token.split(".")[1]);
//     user_info = user_info.split(',');
//     username = user_info[1].split(":")[1];
//     username = username.substring(1, username.length - 1); 
// }
// game_socket.emit('check-if-user-in-room');

// function startGame(){}
game_socket = io("http://localhost:5555/");
const token = getCookie('access-token');
let user_info = atob(token.split(".")[1]);
user_info = user_info.split(',');
var id = user_info[0].split(":")[1];
id = id.substring(1, id.length - 1);
var username = user_info[1].split(":")[1];
username = username.substring(1, username.length - 1); 
var gameChar;
var playerChar;
var fullQuest;
var clueCookie;

// Get elements by their id
const dropBombButton = document.getElementById("drop-bomb");
const submitButton = document.getElementById("submit-flag");
const clueButton = document.getElementById("clue");
const clueText = document.getElementById("clue-text");
const clueItself = document.getElementById("clue-itself");
const submitFlagBtn = document.getElementById("submit-flag");
const answerForm = document.getElementById("answer-form");
const quest_image = document.getElementById("quest-img");

// game_socket.emit("load-game");
function getGameChars(){
    $.when(getChars()).done(function(){
        game_socket.emit("join-room-char", { gc: gameChar, un: username, pc: playerChar });
        game_socket.emit("get-players-name", { gc: gameChar, un: username, pc:playerChar });//id: id });
        game_socket.emit("get-quest", { pc: playerChar, id: id });

        // $.when(getQuest()).done(function(quest){
        
            // console.log(quest);
            // game_socket.emit("set-quest", { fquest: quest });
        // });
        // showQuest();
    });
}

// game_socket.emit("get-players-name", { gc: "3PSr5mbHkA0uV6IIgQTg78eJE", un: "username"});
game_socket.on("return-details", ({ players_details, wid }) => {
    for(let i = 0; i < players_details.length; i++){
        let table = document.getElementById("players");
        if(players_details[i].name === username){
            if(document.getElementById(i) != null){
                document.getElementById(i).remove();
            }
            var addPlayer = `
            <tr id=${i}>
                <td>${players_details[i].name}</td>
                <td>${players_details[i].health}</td>
                <td>${players_details[i].bombs}</td>
                <td>
                    <button type="submit" class="drop-bomb" id="bomb-${i}">Suicide</button>
                </td>
            </tr>
            `;
            document.getElementById("number-bombs").innerHTML = players_details[i].bombs;
            // document.getElementById("bar").innerHTML = players_details[i].health + "%";
            document.getElementById("health-text").innerHTML = players_details[i].health + "%";
            document.getElementById("bar").style.width = players_details[i].health + "%";
        }else{
            if(document.getElementById(i) != null){
                document.getElementById(i).remove();
            }
            var addPlayer = `
            <tr id=${i}>
                <td>${players_details[i].name}</td>
                <td>${players_details[i].health}</td>
                <td>${players_details[i].bombs}</td>
                <td>
                    <button type="submit" class="drop-bomb" id="bomb-${i}">Drop Bomb</button>
                </td>
            </tr>
            `;
        }
        table.innerHTML += addPlayer;
        // var bombButton = document.getElementById("bomb-" + i);
        // bombButton.onclick = getBombStatus("drop-bomb", i);
    }
    var bombButtons = document.getElementsByClassName("drop-bomb");
    for(let i = 0; i < bombButtons.length; i++){
        bombButtons[i].onclick = function(){
            game_socket.emit("get-bomb-status", { username: username, type: "drop-bomb", gc: gameChar, id: i });
        };
    }
    if(players_details[wid]){
        alert("The Winner is " + players_details[wid].name);
        game_socket.emit("leave-game", { gc: gameChar, pc: playerChar });
    }
});

game_socket.on("finished-game", (url) => {
    $.get("/remove_game_chars", function(){
        window.location.replace(url);
    });
});

game_socket.on("result-bomb-status", ({ status, type, tid }) => {
    if(status === true){
        if(type === "clue"){
            game_socket.emit("decrease-bomb", { username: username, gc: gameChar });
            return $.post("/get_clue", { quest_id: fullQuest[0] }, function(clue, status){
                if(status == "success"){
                    showClue(clue);
                }
            });
        }else if(type === "drop-bomb"){
            game_socket.emit("decrease-health", { player_id: tid, gc: gameChar });
            game_socket.emit("decrease-bomb", { username: username, gc: gameChar });
        }
    }else{
        console.log("Can't Use Bombs!");
    }
});

// game_socket.emit("get-available-players-name", { gc: gameChar, un: username});

// window.onload=function(){game_socket.on("return-names", names => {
//     players = names;
      
//     for(let i = 0; i < players.length; i++){
//         let table = document.getElementById("players");
//         let addPlayer = `
//         <tr>
//             <td>${players[i]}</td>
//         </tr>
//         `;
//         table.innerHTML += addPlayer;
//     }
// });
// }
// get cookie value
function getCookie(cookie_name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookie_name}=`);
    if(parts.length === 2){
        return parts.pop().split(';').shift();
    }else{
        return "";
    }
}

function getChars(){
    return $.get("/get-chars", function(chars){
        gameChar = chars.gc;
        playerChar = chars.pc;
    });
}

function getQuest(quest_id){
    $.post("/get-quest", { quest_id: quest_id }, function(data, status){
        if(status == "success"){
            game_socket.emit("set-quest", { fdata: data, pc: playerChar});//id: id });
            showQuest();
        }
    }); 
}


function showQuest(){
    // const quest_text = document.getElementById("quest-itself");
    // quest_text.innerHTML = quest[1];
    game_socket.emit("get-quest", { pc: playerChar, id: id });
}

game_socket.on("return-quest", (quest) => {
    const quest_text = document.getElementById("quest-itself");
    if(quest == -1){
        getQuest(quest);
    }else{
        fullQuest = quest;
        if(quest[2] != 1){
            console.log(quest[2]);
            showQuestImage(quest[2]);
        }else{
            quest_image.style.display = null;
            quest_image.src = "";
        }
        quest_text.innerHTML = quest[1];
        // var started = Date.now();
        // var interval = setInterval(function(){
        //     if(Date.now() - started > 1000 * 60){
        //         clearInterval(interval);
        //     }else{
                
        //         quest_image.src = "img/quest_image.png?" + fullQuest[2];
        //     }
        // }, 1000 * 10);
    }
});

function getClue(){
    // return $.get("/get_quest_id", function(quest_id){
    //     if(quest_id === -1){
    //         console.log("error");
    //     }else{
    //         game_socket.emit("get-bomb-status", { username: username, type: "clue", id: quest_id });
    //     }
    // });
    $.when(isClue()).done(function(){
        if(clueCookie == null || clueCookie == undefined){
            game_socket.emit("get-bomb-status", { username: username, type: "clue", gc: gameChar });
        }
    });
}

function showQuestImage(imageName){
    $.post('/get_image', { imageName: imageName }, (image) => {
        quest_image.style.display = "block";
        quest_image.src = "data:image/jpeg;base64," + image;
    });
}

function showClue(clue){
    document.getElementById("clue-background").style.display = "initial";
    clueText.style.display = "initial";
    clueItself.innerHTML = clue;
}

function hideClue(){
    // document.getElementById("clue-background").style.display = "none";
    // clueText.style.display = "none";
    // clueItself.innerHTML = "";
    document.getElementById("clue-background").style.display = null;
    clueText.style.display = null;
    clueItself.innerHTML = null;
}

function checkAnswer(){
    const answer_input = document.getElementById("answer").value;
    if(answer_input){
        answerForm.dispatchEvent(new Event('submit'));
    }
}

answerForm.addEventListener('submit', function(e){
    var answer_input = document.getElementById("answer");
    e.preventDefault();
    submitFlagBtn.disabled = true;
    $.when(checkAnswerPost(answer_input.value)).done(function(res){
        if(res === "right"){
            $.get("/remove_clue");
            hideClue();
            answer_input.value = "";
            game_socket.emit("add-bomb", { username: username, gc: gameChar, pc: playerChar});//id: id });
            game_socket.emit("get-quest", { pc: playerChar}); // , id: id });
            submitFlagBtn.disabled = false;
        }else{
            console.log("wrong");
            answer_input.value = "";
            submitFlagBtn.disabled = false;
        }
    });
});

function checkAnswerPost(answer_input){
    return $.post("/check_answer", { answer: answer_input, quest_id: fullQuest[0] });
}

function isClue(){
    return $.get("/get_clue", function(questClue){
        if(questClue == ""){
            clueCookie = null;
        }else{
            clueCookie = questClue;
        }
    });
}

window.onload = function(){
    getGameChars();
    $.get("/get_clue", function(clue){
        if(clue != ""){
            showClue(clue);
        }
    });
}

// window.onbeforeunload = function(){
//     game_socket.emit("force-disconnect", { id: id });
// }
// function getBombStatus(type, obj){
//     console.log(obj.id);
//     game_socket.emit("get-bomb-status", { username: username, type: type, id: event.target.id });
// }