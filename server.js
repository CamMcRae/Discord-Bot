const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);

const io = sio(server);

io.on('connect', (socket) => {
  console.log('Client connected');
  io.sockets.emit('time', new Date().toTimeString());
  socket.on('disconnect', () => console.log('Client disconnected'));
});