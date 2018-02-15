const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
   client.user.setUsername("Bot Dude");
});

client.on('message', message => {
    if (message.content === 'ping') {
      client.reply('pong');
    }
});

client.login(process.env.BOT_TOKEN);
