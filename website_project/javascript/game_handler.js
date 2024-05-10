// module.exports = (io) => {
//     const MAX_PLAYERS = 2;
//     var waiting_users = [];
//     const players_in_room = {};
//     // const rooms_and_players = {};
//     const quests = {};
//     var total_rooms_connections = 0;
//     //const games = [];
//     var roomChar;
//     // const quest_answers = []
//     io.on('connection', socket => {
//         // Handling when user is searching for game or found a game
//         socket.on('get-username', username => {
//             var isUserAlreadyWait;
//             if(waiting_users.length == 0){
//                 // waiting_users.push(username);
//                 isUserAlreadyWait = false;
//             }else{
//                 for(i = 0; i < waiting_users.length; i++){
//                     if(waiting_users[i] == username){
//                         isUserAlreadyWait = true;
//                         break;
//                     }else{
//                         isUserAlreadyWait = false;
//                     }
//                 }
//             }
//             if(isUserAlreadyWait === false){
//                 waiting_users.push(username);
//                 if(waiting_users.length === MAX_PLAYERS){
//                     while(waiting_users.length > 0){
//                         waiting_users.pop();
//                     }
//                     // game_char = createRandomStringGame();
//                     io.emit('found-game');
//                 }else{
//                     socket.emit('timer');
//                 }
//             }else{
//                 socket.emit('timer');
//             }
//         });

//         // loading the game after found enough players to start the game
//         socket.on("load-game", () =>{
//             // for(var i = 0; i < players_in_room.length; i++){
//             //     players_in_room.pop();
//             // }
//             player_char = createRandomStringGame();
//             let { total_rooms, gameChar } = getGameString(total_rooms_connections, MAX_PLAYERS);
//             total_rooms_connections = total_rooms;
//             if(gameChar){
//                 roomChar = gameChar;
//             }
//             socket.emit("set-room-char", { gc: roomChar, pc: player_char, ps: "ggpc" });
//             // socket.join(roomChar);
//             // socket.join(player_char);
//         });

//         // joining the chars of the player and the game and set an array in players_in_room is key called like the gameChar if there is no current array that is existing
//         socket.on("join-room-char", chars => {
//             socket.join(chars.pc);
//             socket.join(chars.gc);
//             try{
//                 if(players_in_room[chars.gc] == null){
//                     players_in_room[chars.gc] = [];
//                 }
//             }
//             catch{
//                 players_in_room[chars.gc] = [];
//             }
//         });

//         // returns to the client all the names and stats of the players after it's pushing them to the array
//         socket.on("get-players-name", data => {
//             let isAlreadyPlayer = false;
//             for(var i = 0; i < players_in_room[data.gc].length; i++){
//                 if(players_in_room[data.gc][i].name === data.un){
//                     isAlreadyPlayer = true;
//                     break;
//                 }
//             }
//             if(!isAlreadyPlayer){
//                 if(players_in_room[data.gc].length === MAX_PLAYERS - 1 || (MAX_PLAYERS === 1 && players_in_room[data.gc].length === 1)){
//                     // for(var i = 0; i < players_in_room.length; i++){
//                     //     players_in_room.pop();
//                     // }
//                     // if(quests[data.pc] != null){
//                     //     quests[data.pc] = null;
//                     // }
//                     // players_in_room.push({ name: data.un, health: 100, bombs: 0 });
//                     players_in_room[data.gc].push({ name: data.un, health: 100, bombs: 0 });
//                     // players_health.push({ name: data.un, health: 100 });

//                     io.sockets.in(data.gc).emit("return-details", { players_details: players_in_room[data.gc] });
//                 }else{
//                     players_in_room[data.gc].push({ name: data.un, health: 100, bombs: 0 });
//                     // players_health.push({ name: data.un, health: 100 });
//                 }
//             }else{
//                 // io.sockets.in(data.gc).emit("return-names", players_in_room);

//                 socket.emit("return-details", { players_details: players_in_room[data.gc] });
//             }
//         });

//         // socket.on("get-quest", ({ pc }) => {
//         //     // for(let i = 0; i < players_in_room.length; i++){
//         //     //     if(pc === players_in_room[i]){

//         //     //     }
//         //     // }
            
//         // });

//         // set a new quest to the user
//         socket.on("set-quest", (data) => {
//             quests[data.pc] = data.fdata;
//         });

//         // get quest to the user
//         socket.on("get-quest",  ({ pc }) => {// , id }) => {
//             if(quests[pc] == null){ // if there isn't quest to the user
//                 io.sockets.in(pc).emit("return-quest", "-1"); // -1 means that it will return random quest from the database
//             }else{ // else - if there is quest to the user
//                 io.sockets.in(pc).emit("return-quest", quests[pc]); // return the same quest that is already set to the user
//             }
//         });

//         // check the use of the bomb(type) and works if there are enough bombs
//         socket.on("get-bomb-status", ({ username, type, gc, id }) => {
//             for(let i = 0; i < players_in_room[gc].length; i++){
//                 if(players_in_room[gc][i].name === username && players_in_room[gc][i].bombs > 0 && players_in_room[gc][i].health !== 0){
//                     if(type === "clue"){
//                         socket.emit("result-bomb-status", { status: true, type: "clue" });
//                     }else if(type === "drop-bomb" && id != null){
//                         socket.emit("result-bomb-status", { status: true, type: "drop-bomb", tid: id });
//                     }
//                 }else{
//                     socket.emit("result-bomb-status", { status: false });
//                 }
//             }
//         });

//         // decrease the health of a player that bomb was exploded on if he has more than 0 health
//         socket.on("decrease-health", ({ player_id, gc }) => {
//             if(players_in_room[gc][player_id].health !== 0){
//                 players_in_room[gc][player_id].health -= 10;
//             }
//             var counter = 0;
//             var winner_id;
//             for(var i=0; i < players_in_room[gc].length; i++){
//                 if(players_in_room[gc][i].health === 0){
//                     counter += 1;
//                 }else{
//                     winner_id = i
//                 }
//             }
//             if(counter == players_in_room[gc].length - 1){
//                 io.sockets.in(gc).emit("return-details", { players_details: players_in_room[gc], wid: winner_id });
//             }else{
//                 io.sockets.in(gc).emit("return-details", { players_details: players_in_room[gc] });
//             }
//         });

//         // deceases one bomb when player is using one
//         socket.on("decrease-bomb", ({ username, gc }) => {
//             for(let i = 0; i < players_in_room[gc].length; i++){
//                 if(players_in_room[gc][i].name === username){
//                     if(players_in_room[gc][i].health !== 0){
//                         players_in_room[gc][i].bombs -= 1;
//                         io.sockets.in(gc).emit("return-details", { players_details: players_in_room[gc] });
//                     }
//                 }
//             }
//         });

//         // adding bomb if user submitted right answer
//         socket.on("add-bomb", ({ username, gc, pc }) => {
//             for(let i=0; i < players_in_room[gc].length; i++){
//                 if(players_in_room[gc][i].name === username){
//                     if(players_in_room[gc][i].health !== 0){
//                         players_in_room[gc][i].bombs += 1;
//                         quests[pc] = null;
//                         io.sockets.in(gc).emit("return-details", { players_details: players_in_room[gc] });
//                     }
//                 }
//             }
//         });

//         // socket.on("get")

//         // socket.on("check-if-user-in-room", (room_char) => {
//         //     console.log(room_char);
//         // });
        
//         // socket.on("get-quest"){

//         // }

//         // leave the game when one player remains with health(the winner)
//         socket.on("leave-game", ({ gc, pc }) => {
//             var url = "/dashboard";
//             socket.join(pc);
//             players_in_room[gc] = null;
//             io.sockets.in(gc).emit("finished-game", url);
//         });
        
//         // remove player from the waiting list by username
//         socket.on("remove-from-waiting-list", (username) => {
//             // var user_index = waiting_users.indexOf(username);
//             // waiting_users.splice(user_index);
//             // socket.emit('user-disconnected');
//             var user_index = waiting_users.indexOf(username);
//             if(user_index > -1){
//                 waiting_users.splice(user_index, 1);
//             }
//         });
        
//         //Handling when user disconnect the socket
//         // socket.on("disconnect", username => {
//         //     var user_index = waiting_users.indexOf(username);
//         //     waiting_users.splice(user_index);
//         //     socket.emit('user-disconnected');
//         // });
//     });

//     // io.on('reconnect', socket => {
//     //     socket.on("load-game", () =>{
//     //         player_char = createRandomStringGame();
//     //         let { total_rooms, gameChar } = getGameString(total_rooms_connections, MAX_PLAYERS);
//     //         total_rooms_connections = total_rooms;
//     //         if(gameChar){
//     //             roomChar = gameChar;
//     //         }
//     //         socket.emit("get-room-char", { gc: roomChar, pc: player_char });
//     //         socket.join(roomChar);
//     //         socket.join(player_char);
//     //     });

//     //     socket.on("get-players-name", data => {
//     //         let isAlreadyPlayer = false;
//     //         for(var i = 0; i < players_in_room.length; i++){
//     //             if(players_in_room[i] === data.un){
//     //                 isAlreadyPlayer = true;
//     //                 break;
//     //             }
//     //         }
//     //         if(!isAlreadyPlayer){
//     //             if(players_in_room.length === MAX_PLAYERS - 1){
//     //                 // for(var i = 0; i < players_in_room.length; i++){
//     //                 //     players_in_room.pop();
//     //                 // }
//     //                 players_in_room.push(data.un);
//     //                 io.sockets.in(data.gc).emit("return-names", players_in_room);
//     //             }else{
//     //                 players_in_room.push(data.un);
//     //             }
//     //         }
//     //     });
//     // });
// }

// // generate random string 
// function createRandomStringGame(){
//     let characters = getAllCharacters();
//     let result = '';
//     const characterLength = characters.length;
//     const stringLength = 25;
//     for(i = 0; i < stringLength; i++){
//         result += characters.charAt(Math.floor(Math.random() * characterLength));
//     }

//     return result;
// }

// // get all the characters(including capital letters, lower letters and numbers)
// function getAllCharacters(){
//     var characters = '';
//     for(i = 65; i < 91; i++){
//         characters += String.fromCharCode(i);
//     }
//     for(i = 97; i < 123; i++){
//         characters += String.fromCharCode(i);
//     }
//     for(i = 48; i < 58; i++){
//         characters += String.fromCharCode(i);
//     }
//     return characters;
// }

// // check if there are enough players(not more or less) in order to start and create game char
// function getGameString(total_rooms, max){
//     if(total_rooms % max === 0){
//         let gameChar = createRandomStringGame();
//         total_rooms++;
//         return { total_rooms, gameChar };
//     }else{
//         total_rooms++;
//         return { total_rooms, undefined };
//     }
// }

module.exports = (websocket, APPID, connections) => {
    websocket.on("request", request => {
        const con = request.accept(null, request.origin);
        con.on("open", () => console.log("Opened!"));
        con.on("close", () => console.log("Closed!"));
        con.on("message", message => {
            // publish message to redis
            console.log(`${message.utf8Data} from ${APPID}`);
            publisher.publish("game", message.utf8Data);
        });

        setTimeout(() => con.send(`Connected successfully to server ${APPID}`), 5000)
        connections.push(con);
    });
}