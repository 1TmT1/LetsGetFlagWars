module.exports = (io) => {
    const users = {};
    io.on('connection', socket => { // when user is connected
        socket.on('new-user', name => { // when the event named new-user is emitted from the client 
            users[socket.id] = name;
        });

        socket.on('send-chat-message', message => { // when the event named send-chat-message is emitted from the client
            socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] }); // the socket is broadcast the message across all the users except the one that emitted the message
        });
    });
}