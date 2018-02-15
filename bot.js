const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on('ready', () => {
  console.log('I am ready!');
   bot.user.setUsername("Bot Dude");
});

bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1);
});

bot.on('message', message => {
    if (message.content === "!restrict") {
      message.reply("wat");
    // message.author.voiceChannel.setUserLimit();
    }
    if (message.content === 'ping') {
      bot.sendMessage(message.channel, 'pong');
    }
});

bot.login(process.env.BOT_TOKEN);
