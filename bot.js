const Discord = require('discord.js');
const bot = new Discord.Client();
const prefix = "$";

bot.on('ready', () => {
  console.log('I am ready!');
  bot.user.setUsername("Bot Dude");
});

bot.on('message', message => {
  if (message.content.startsWith(prefix + "restrict") && message.auther.hasPermission("ADMINISTRATOR")) {
    message.channel.send('wat');
    // message.author.voiceChannel.setUserLimit(message.content.substr(10));
  } else if (message.content === 'ping') {
    message.channel.send('pong');
  } else if (message.content === 'pong') {
    message.channel.send('hah you suck');
  } else if (message.content.startsWith(prefix + "lmgtfy")) {
    message.channel.send("http://lmgtfy.com/?q=" + message.content.substr(8).replace(/ /g, 'hi', "%20"));
  }
});
//asdas
bot.login(process.env.BOT_TOKEN);
