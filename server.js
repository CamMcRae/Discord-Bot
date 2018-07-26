const lunch = require("./server commands/lunch.js");

let md5 = require('md5');
let express = require('express')();
let http = require('http');
let server = http.createServer();
let io = require('socket.io')(server)
server.listen(process.env.PORT);


io.on('connect', (socket) => {
  console.log("Client Connected");
  socket.on("getMenu", async (d) => {
    if (md5(d.hash) != process.env.HASH) return;
    const menu = {}
    for (let i = 0; i < d.dates.length; i++) {
      menu[i] = await lunch.run(d.dates[i]);
    }
    socket.emit('returnMenu', menu);
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// stop server sleeping
// const keepAwake = require('http')
// setInterval(() => {
//   keepAwake.get("https://nutty-discord-bot.herokuapp.com/")
// }, 300000);