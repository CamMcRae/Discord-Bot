const lunch = require("./server commands/lunch.js");

const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);
const io = sio(server);

io.on('connect', (socket) => {
  socket.on("getMenu", async (d) => {
    let menu = await lunch.run(d);
    console.log(menu);
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});