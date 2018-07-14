const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);
const io = sio(server);


io.on('connect', (socket) => {
  console.log('Client connected');
  setTimeout(stuff, 1000);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

function stuff() {
  io.emit("test", "Stuff and things");
}