// libs
const Discord = require("discord.js");

// files
const bot = new Discord.Client();

bot.on('ready', () => {
  console.log('I am ready!');
  bot.user.setPresence({
    game: {
      name: "a game"
    }
  });
});

bot.login(process.env.BOT_TOKEN);

bot.on('message', message => {
  // if a bot is talking or not a server
  if (message.author.bot) return;
  if (!message.guild) return;

  // subreddit
  if (message.content.startsWith("r/")) {
    message.delete();
    message.channel.send("https://www.reddit.com/" + message.content.trim());
  }

  // ping the bot
  switch (message.content.toLowerCase()) {
    case "ping":
      message.channel.send(`Pong! ${Date.now() - message.createdAt.getTime()}ms`);
    case "pong":
      message.channel.send('hah you suck');
      break;
  }

  const config = {
    prefix: "$",
    adminRole: "Administrator",
    admin: "124349142708387840"
  }

  if (!message.content.startsWith(config.prefix)) return;

  const query = message.content.slice(config.prefix.length).trim().split(/ +/g); // gets query
  const cmd = query.shift().toLowerCase(); // gets command
  let file;

  // changes command to proper filename
  switch (cmd) {
    case "purge":
    case "clean":
      file = "clean"
      break;
    case "roll":
      file = "diceRoll"
      break;
    case "coinflip":
    case "flipacoin":
      file = "coinflip"
      break;
    default:
      file = cmd
  }

  console.log(file);

  try {
    require(`./commands/${file}.js`).run(bot, message, query);
  } catch (err) {}

  // admin commands
  if (message.member.roles.find("name", config.adminRole)) {
    try {
      require(`./commands/admin/${file}.js`).run(bot, message, query);
    } catch (err) {}
  }
});