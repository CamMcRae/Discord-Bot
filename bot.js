const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
   client.user.setUsername("Bot Dude");
});

client.on('message', message => {
    if (message.content === "!restrict") {
      message.reply("wat");
    // message.author.voiceChannel.setUserLimit();
    }
    if (message.content === 'ping') {
      client.sendMessage(message.channel, 'pong');
    }
});

client.login(process.env.BOT_TOKEN);
