const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);
const io = sio(server);


io.on('connect', (socket) => {
  console.log('Client connected');
  socket.emit("time", new Date());
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.sockets.emit('time', new Date()), 1000);