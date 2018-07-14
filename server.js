const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);
const io = sio(server);


io.on('connect', (socket) => {
  console.log('Client connected');
  io.sockets.emit('test', "The quick brown fox");
  socket.on('disconnect', () => console.log('Client disconnected'));
});

socket.on("getMenu", (socket) => {
  console.log(socket);
})