// libs
const Discord = require("discord.js");

// files
const bot = new Discord.Client();

// Redis setup
let rtg = require("url").parse(process.env.REDISTOGO_URL);
let redis = require("redis").createClient(rtg.port, rtg.hostname);

redis.auth(rtg.auth.split(":")[1]);

redis.on("ready", () => {
  console.log("redis ready!");
});

redis.on('error', (err) => {
  console.log('Something went wrong ' + err);
});

const defaultSettings = {
  prefix: "$",
  adminRole: "Administrator",
  mainID: "",
  musicID: ""
}

// GUILD SETUPS IN REDIS
bot.on("guildCreate", guild => {
  redis.set((guild.id).toString(), JSON.stringify(defaultSettings));
});

bot.on("guildDelete", guild => {
  redis.del((guild.id).toString());
});

bot.on('ready', () => {
  console.log('I am ready!');
  bot.user.setPresence({
    game: {
      name: "a game"
    }
  });
  require("./commands/createEmbed").setClient(bot);
});

bot.login(process.env.BOT_TOKEN);

bot.on('message', message => {

  // deletes any messages starting with !
  if (message.content.slice(0, 1) == "!" || message.content.slice(0, 1) == ">") {
    const channel = message.guild.channels.find(channel => channel.name === "music");
    if (message.channel == channel) return;
    message.delete();
    message.channel.send("Use " + channel.toString() + " please! :angry: " + message.author);
  }

  // deletes any bot messages
  if (message.author.bot) {
    const channel = message.guild.channels.find(channel => channel.name === "music");
    if (message.channel == channel) return;
    if (message.author.id != bot.user.id) {
      message.delete();
    }
  }

  // if a bot is talking or not a server
  if (message.author.bot) return;
  if (!message.guild) return;

  // subreddit
  if (message.content.startsWith("r/")) {
    message.delete();
    message.channel.send("https://www.reddit.com/" + message.content.trim());
  }

  // sends prefix
  if (message.content == "prefix") {
    redis.get((message.guild.id).toString(), (err, result) => {
      if (err) {
        console.log("Error getting key");
      }
      message.channel.send("Prefix: " + JSON.parse(result).prefix);
    });
  }

  // ping the bot
  switch (message.content.toLowerCase()) {
    case "ping":
      message.channel.send(`Pong! ${Date.now() - message.createdAt.getTime()}ms`);
    case "pong":
      message.channel.send('hah you suck');
      break;
  }

  redis.get((message.guild.id).toString(), (err, result) => {

    const config = JSON.parse(result);

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

    try {
      require(`./commands/${file}.js`).run(bot, message, query, config, redis);
    } catch (err) {
      console.log(err);
    }

    // admin commands
    if (message.member.roles.find("name", config.adminRole)) {
      try {
        require(`./commands/admin/${file}.js`).run(bot, message, query, config, redis);
      } catch (err) {
        console.log(err);
      }
    }
  });
});