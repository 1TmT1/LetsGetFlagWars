//import * as jwt_decode from './jwt-decode.js';

const chat_socket = io('http://localhost:3000/');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

let isAtBottom = true;

const token = getCookie('access-token');
let user_info = atob(token.split(".")[1]);
user_info = user_info.split(',');
let username = user_info[1].split(":")[1];
username = username.substring(1, username.length - 1);

chat_socket.emit('new-user', username); // emits to event called new-user with username

// get data of message
chat_socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`);
});

// when form messageForm submitted this event is called with its callback function
messageForm.addEventListener('submit', e => {
    e.preventDefault(); // prevent the default behavior
    const message = messageInput.value;
    appendMessageByMe(`You: ${message}`);
    chat_socket.emit('send-chat-message', message); // send the message to the rest of the users by emitting the message to the chat_handler
    messageInput.value = '';
});

// functiion get a message and add it to the messages
function appendMessageByMe(message){
    const messageElement = document.createElement('div');
    messageElement.classList.add("messages-by-user");
    messageElement.innerText = message;
    messageContainer.append(messageElement);
    updateScroll();
}

// function is getting a message that was written by other user and add it to the messages
function appendMessage(message){
    const messageElement = document.createElement('div');
    messageElement.classList.add("messages");
    messageElement.innerText = message;
    messageContainer.append(messageElement);
    if(isAtBottom){
        updateScroll();
    }
}

//Handling the scroll feature of the chat
function isBottom(){
    if(messageContainer.scrollTop + messageContainer.offsetHeight + 75 >= messageContainer.scrollHeight){
        isAtBottom = true;
    }else{
        isAtBottom = false;
    }
}

// set the scroll of the message container to the end(its height)
function updateScroll(){
        messageContainer.scrollTop = messageContainer.scrollHeight;
}

// can get cookie that is not httpOnly
function getCookie(cookie_name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookie_name}=`);
    if(parts.length === 2){
        return parts.pop().split(';').shift();
    }else{
        return "";
    }
}
