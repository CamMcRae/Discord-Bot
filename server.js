const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);
const io = sio(server);

io.on('connect', (socket) => {
  console.log('Client connected');
  socket.on("getMenu", (d) => console.log(d));
  socket.on('disconnect', () => console.log('Client disconnected'));
});

io.on("getMenu", (socket) => {
  console.log(socket);
})