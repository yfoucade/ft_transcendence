const messageInput = document.getElementById('message-input');
const messageBox = document.getElementById('message-box');

function sendMessage() {
	const message = messageInput.value;
	displayMessage(message, 'user');
	messageInput.value = '';
}

function displayMessage(message, sender) {
	const messageElement = document.createElement('div');
	messageElement.className = sender;
	messageElement.innerText = message;
	messageBox.append(messageElement);
	messageBox.scrollTop = messageBox.scrollHeight;
}


const sendButton = document.getElementById('message-input');
messageInput.addEventListener('keydown', function(event) {
	if (event.key == 'Enter') {
		sendMessage();
	}
});


// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');

// const port = 8000;
// const server = http.createServer(express);
// const wss = new WebSocket.Server({ server })

// wss.on('connection', function connection(ws) {
// 	ws.on('message', function incoming(data) {
// 		wss.clients.forEach(function each(client) {
// 			if (client != ws && client.readyState == WebSocket.OPEN) {
// 				client.send(data)
// 			}
// 		})
// 	})
// })

// server.listen(port, function() {
// 	console.log(`Server is listening on $(port)!`)
// })