// libs
const Discord = require("discord.js");
const bot = new Discord.Client();

// Redis setup
let rtg = require("url").parse(process.env.REDISTOGO_URL);
let redis = require("redis").createClient(rtg.port, rtg.hostname);
redis.auth(rtg.auth.split(":")[1]);

// when redis is ready to be used
redis.on("ready", () => {
  console.log("redis ready!");
});

// if error on redis initiation
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
// when the bot is added to a guild
bot.on("guildCreate", guild => {
  redis.set((guild.id).toString(), JSON.stringify(defaultSettings));
});

// when the bot is added to a guild
guildbot.on("guildDelete", guild => {
  redis.del((guild.id).toString());
});

// when the bot is ready to be used
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

  // deletes any messages starting with ! or >
  if (message.content.slice(0, 1) == "!" || message.content.slice(0, 1) == ">") {
    redis.get((message.guild.id).toString(), (err, result) => {
      if (err) console.log(err);
      if (JSON.parse(result).musicID) {
        if (message.channel.id == JSON.parse(result).musicID) return;
        message.delete();
        message.channel.send("Use " + message.guild.channels.find(c => c.id == JSON.parse(result).musicID).toString() + " please! :angry: " + message.author);
      }
    });
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
      if (err) console.log("Error getting key");
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

  // main command handler
  redis.get((message.guild.id).toString(), (err, result) => {

    const config = JSON.parse(result);

    // doesn't allow regular messages
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