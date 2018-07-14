const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);

const io = sio(server);

io.on('connect', (socket) => {
  console.log(socket);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.sockets.emit('time', new Date()), 1000);