const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);

const io = sio(server);

io.on('connect', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.emit('time', new Date().toTimeString()), 2000);