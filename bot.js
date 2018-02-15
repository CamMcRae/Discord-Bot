const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
   bot.user.setUsername("Bot Dude");
});

client.on('message', message => {
  if (message.client == "AcrobaticMouse#8451") {

  } else {
    if (message.content === 'ping') {
      message.reply('pong');
    }
  }
});

client.login(process.env.BOT_TOKEN);
