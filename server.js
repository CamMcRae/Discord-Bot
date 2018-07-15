const lunch = require("./server commands/lunch.js");

const http = require('https');
const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);
const io = sio(server);


io.on('connect', (socket) => {
  console.log("Client Connected");
  socket.on("getMenu", async (d) => {
    const menu = await lunch.run(d);
    socket.emit('returnMenu', menu);
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => {
  http.get("https://nutty-discord-bot.herokuapp.com/")
}, 300000);