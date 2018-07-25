const lunch = require("./server commands/lunch.js");

const express = require('express')();
const server = require('https').createServer(express);
const io = require('socket.io')(server)
server.listen(process.env.PORT);


io.on('connect', (socket) => {
  console.log("Client Connected");
  socket.on("getMenu", async (d) => {
    const menu = {}
    for (let i = 0; i < d.dates.length; i++) {
      menu[i] = await lunch.run(d.dates[i]);
    }
    socket.emit('returnMenu', menu);
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// stop server sleeping
setInterval(() => {
  http.get("https://nutty-discord-bot.herokuapp.com/")
}, 300000);