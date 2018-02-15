const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on('ready', () => {
  console.log('I am ready!');
  bot.user.setUsername("Bot Dude");
});

bot.on('message', message => {
  if (message.content.startsWith("!restrict")) {
    message.channel.send("wat");
    // message.author.voiceChannel.setUserLimit();
  }
  if (message.content === 'ping') {
    message.channel.send('pong');
  }
});

bot.login(process.env.BOT_TOKEN);
