const lunch = require("./server commands/lunch.js");

const http = require('https');
const express = require('express')();
const sio = require('socket.io')
const server = express.listen(process.env.PORT);
const io = sio(server);


io.on('connect', (socket) => {
  console.log("Client Connected");
  socket.on("getMenu", async (d) => {
    const menu = {}
    console.log(d);
    for (let i = 0; i < d.length; i++) {
      menu[i] = await lunch.run(d[i]);
      console.log(menu);
    }
    console.log(menu);
    socket.emit('returnMenu', menu);
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => {
  http.get("https://nutty-discord-bot.herokuapp.com/")
}, 300000);