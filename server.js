const lunch = require("./server commands/lunch.js");

const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);
const io = sio(server);

io.on('connect', (socket) => {
  socket.on("getMenu", (d) => {
    console.log(lunch.run(d));
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});