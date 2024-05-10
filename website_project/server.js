const { client } = require('websocket');

//Main function
const main = () => {
    //Import
    const express = require('express'); // Importing module express - allows to serve files and content based on the routings 
    const authRoutes = require('./routes/auth'); // Importing module auth - hendles the routing of all the routes that are connected to authentication(login, sign_up, reset_password, activate_account, etc)
    const resGetters = require('./routes/res_getters'); // Importing module res_getters - handles the routing
    const chat_socket = require('./javascript/chat_handler'); // Importing module chat_handler - handles the chat events
    const game_socket = require('./javascript/game_handler'); // Importing module game_handler - handles the game events
    const path = require('path'); // Importing module path - allow to work with directories
    const cookieParser = require('cookie-parser'); // Importing module cookie-parser - allows to work with cookies with express
    const redis = require("redis"); // Importing module Redis - allows to use and manage redis db 
    const APPID = process.env.APPID;
    // const ws = require("websocket");
    // const http = require("http");
    // const helmet = require("helmet");

    
    // const secureHttpServer = https.createServer({
    //     key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
    //     cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
    // }, app);

    const app = express(); // creates an express application
    // const chat_server = require('http').createServer(); // creates http server to the chat
    // const game_server = require('http').createServer(); // creates http server to the game
    const expressWs = require("express-ws")(app);
    // const chat_io = require('socket.io')(chat_server, {
    //     cors: {
    //         origin: "http://localhost:8080", // give the ability to communicate with the main server(express app)
    //         methods: ["GET", "POST"] // sets the available methods it can accept from the origin
    //     }
    // }); // sets the server of the chat

    // const game_io = require('socket.io')(game_server, {// secureHttpServer, {
    //     cors: {
    //         origin: "http://localhost:8080", // give the ability to communicate with the main server(express app)
    //         methods: ["GET", "POST"] // sets the available methods it can accept from the origin
    //     }
    // });// sets the server of the game

    let connections = [];
    // const WebSocketServer = ws.server;

    const subscriber = redis.createClient({
        port: 6379,
        host: 'rds'
    });

    const publisher = redis.createClient({
        port: 6379,
        host: 'rds'
    });

    subscriber.on("subscribe", function(channel, count) {
        console.log(`Server ${APPID} subscribed successfully to socket`);
        publisher.publish("game", "a message");
    });
    
    subscriber.on("message", function(channel, message) {
        try {
            console.log(`Server ${APPID} recieved message in channel ${channel}`);
            connections.forEach(c => c.send(APPID + ":" + message));
        } catch(err) {
            console.log("ERR: " + err);
        }
    });

    subscriber.subscribe("game");

    // const httpServer = http.createServer(app);
    // const websocket = new WebSocketServer({
    //     // "httpServer": httpServer
    //     noServer: true
    // });

    //Port the server is running on
    const PORT = process.env.PORT || 8080; // set a variable to the port of the express app will listen to (8080 or environment variable named PORT)
    const CHAT_PORT = process.env.CHAT_PORT || 3000; // set a variable to the port of the chat server will listen to (3000)
    const GAME_PORT = process.env.GAME_PORT || 5555; // set a variable to the port of the game server will listen to (5555)

    //Static files
    app.use('/css', express.static(path.join(__dirname, '/css'))); // allows the express app to serve css when url is "/css" (serving the images that can be found in current directory under css folder)
    app.use('/js', express.static(path.join(__dirname, '/javascript'))); // allows the express app to serve javascript when url is "/js" (serving the images that can be found in current directory under javascript folder)
    app.use('/img', express.static(path.join(__dirname, '/images'))); // allows the express app to serve images when url is "/img" (serving the images that can be found in current directory under images folder)
    app.use(express.json()); // allows the use of POST requests of Content-type: application/json
    app.use(express.urlencoded({ extended: false })); // allows the use of POST requests of Content-type: application/x-www-form-urlencoded (extended set to false in order to use querystring library, no need for qs which allows richer objects and arrays to be encoded)
    app.use(cookieParser()); // allows to use cookies within the web application
    app.set('view engine', 'ejs'); // this "set" is giving the ability to render *.ejs files (html files with javascript inside them).
    app.use(resGetters); // sets the general routings of the web application
    app.use(authRoutes); // sets the routings of the authentication routes like sign_up, login, reset_password and etc 

    app.ws('/ws/echo', (ws, req) => {
        ws.on('message', msg => {
            console.log(msg);

            const wss = expressWs.getWss();
            wss.clients.forEach(client => client.send("Recieved: " + msg));
            publisher.publish("game", msg);
        });

        connections.push(ws);
    });

    // chat_socket(chat_io); // passing chat_io to main function in chat_handler
    // game_socket(game_io); // passing game_io to main function in game_handler
    // game_socket(websocket, APPID, connections);

    //Listening as a server on a port
    //app.listen(PORT, () => console.log('Listening on port ' + PORT)); 

    // chat_server.listen(CHAT_PORT, () => console.log('Chat is listening on port ' + CHAT_PORT)); // set the chat_server http server to listen on port 3000 and callback function is printing to the console "Listening on port + PORT_NUMBER(3000)"
    // game_server.listen(GAME_PORT, () => console.log('Game is listening on port ' + GAME_PORT)); // set the game_server http server to listen on port 5555 and callback function is printing to the console "Listening on port + PORT_NUMBER(5555)"
    // httpServer.listen(GAME_PORT, () => console.log("Websocket server is running on port " + GAME_PORT));
    app.listen(PORT, () => console.log('Listening on port ' + PORT)); // set the express application to listen on port 8080 and callback function is printing to the console "Listening on port + PORT_NUMBER(8080)"
}

main(); // runs the main function
