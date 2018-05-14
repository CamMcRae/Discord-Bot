// libs
const Discord = require("discord.js");
const fastparse = require('fast-xml-parser');
const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');

// files
const bot = new Discord.Client();
const utils = require("./utils.js");
const lookup = require("./lookup.js");
const other = require("./other.js");
const lunch = require("./lunchMenu.js");
const commands = require("./commands.json");

// keys from heroku
const dictKey = process.env.DICT_TOKEN;
const thesKey = process.env.THES_TOKEN;

// other setup items
const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const firstTen = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

// Enmap setup
const settings = new Enmap({
  provider: new EnmapSQLite({
    name: "settings"
  })
});
const defaultSettings = {
  prefix: "$",
  adminRole: "Administrator",
  mainID: "",
  musicID: ""
}

// config setup
// bot.on("guildCreate", guild => {
// settings[guild.id] = defaultSettings;
// });

// bot.on("guildDelete", guild => {
// delete settings[guild.id]
// })


// bot.on("guildCreate", guild => {
//   settings.set(guild.id, defaultSettings);
//   console.log(settings);
// });
//
// bot.on("guildDelete", guild => {
//   settings.delete(guild.id);
// });

bot.on('ready', () => {
  console.log('I am ready!');
  bot.user.setPresence({
    game: {
      name: "a game"
    }
  });
  utils.setClient(bot);
  // bot.user.setUsername("Bot Dude");
});

// bot.on('reconnecting', () => {
//
// });
//
// bot.on('resume', () => {
//
// });

bot.login(process.env.BOT_TOKEN);

bot.on('message', message => {
  message.edit("sup bitch");
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

  if (!message.guild || message.author.bot) return; // if a bot is talking or not a server

  if (message.content.startsWith("r/")) {
    message.delete();
    message.channel.send("https://www.reddit.com/" + message.content.trim());
  }

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

  let query = message.content.slice(config.prefix.length).trim().split(/ +/g); // gets query
  const command = query.shift().toLowerCase(); // gets command

  // // point system
  // if (!points[message.author.id]) {
  //   points[message.author.id] = {
  //     words: 0,
  //     messages: 0
  //   };
  // }
  // points[message.author.id].messages++;
  // if (words.some(word => message.content.includes(word))) {
  //   points[message.author.id].words++;
  // }

  // cases
  if (message.member.roles.find("name", config.adminRole)) {
    switch (command) {
      case "setconfig":
        setconfig(message, query, config); // Updates config
        break;
      case "showconfig":
        message.channel.send(utils.showconfig(config));
        break;
      case "restrict":
        utils.restrict(message, query);
        break;
      case "link":
        utils.link(message, query, config);
        break;
      case "prefix":
        utils.prefix(message, query, config);
        break;
        // case "swears":
        //   entries = [];
        //   for (let i = 0; i < Object.keys(config.counter).length; i++) {
        //     entries.push([Object.entries(config.counter)[i]]);
        //   }
        //   message.channel.send(createEmbed(entries, "swears"));
        //   break;
    }
  }
  switch (command) {
    case "unmute":
      const unmute = require("./unmute.js");
      unmute.run(bot, message, query);
      break;
    case "commands":
      message.channel.send(utils.createEmbed(commands, "commands"));
      break;
    case "lmgtfy":
      message.channel.send("http://lmgtfy.com/?q=" + message.content.substr(8).replace(/ /g, "%20"));
      break;
    case "define":
      const dictSearchQuery = query.join(" ");
      if (dictSearchQuery) {
        let url = `https://www.dictionaryapi.com/api/v1/references/collegiate/xml/${dictSearchQuery.split(" ").join("%20")}?key=${dictKey}`;
        dictThes(url, "dict", dictSearchQuery, message);
      }
      break;
    case "thesaurus":
      const thesSearchQuery = query.join(" ");
      if (thesSearchQuery) {
        let url = `https://www.dictionaryapi.com/api/v1/references/collegiate/xml/${thesSearchQuery.split(" ").join("%20")}?key=${dictKey}`;
        dictThes(url, "thes", thesSearchQuery, message);
      }
      break;
    case "purge":
    case "clean":
      message.delete();
      utils.clean(query, message, config);
      break;
    case "spell":
      other.spell(query, message);
      break;
    case "lenny":
      message.delete();
      if (message.author.id == config.ownerId) {
        message.channel.send("( ͡° ͜ʖ ͡°)");
      }
      break;
    case "coinflip":
    case "flipacoin":
      message.channel.send(other.coinflip(query));
      break;
    case "roll":
      other.rollDice(query, message);
      break;
    case "lunch":
      const date = lunch.createDate(query, message);
      const type = true;
      if (date) {
        lunchMenu(date, type, message);
      } else {
        message.channel.send("Invalid Arguments" + utils.commandUsage("lunch", config.prefix));
      }
      // link: https://menu2.danahospitality.ca/hsc/menu.asp?r=1&ShowDate=1/26/2018
      break;
    case "move":
      // makes sure user is in mentioned users
      if (!message.member.roles.find("name", config.adminRole)) {
        if (!message.mentions.users.find(user => user.id == message.member.id)) {
          break;
        }
        // makes sure someone is mentioned
        if (!message.mentions.users.first()) {
          message.channel.send(":x: Mention who you want to move.\n - " + commands.move.usage.join("\n - "));
          break;
        }
      }

      // makes sure member is in a voice channel
      if (!message.member.voiceChannel) {
        message.channel.send(":x: You need to be in a voice channel to use this command.");
        break;
      }

      utils.moveChannel(message, query);
      break;
  }
});

// date, t/f, t = day;
async function lunchMenu(date, type, message) {
  const data = await lunch.scrapePage(date);
  const menu = lunch.sort(data, date, type);

  if (menu.fields.length > 1) {
    message.channel.send(utils.createEmbed(menu, "lunch"));
  } else {
    message.channel.send("No Lunch for " + date);
  }
}

// pre: config key asked to be changed
// post: config will be changed if possible
async function setconfig(message, query, config) {
  const config2 = config; // Backup config
  if (query.length != 2) message.channel.send("Invalid arguments");
  const key = query.shift();

  if (!guildConf.hasOwnProperty(key)) {
    return message.channel.send("This key is not in the configuration.");
  }
  config[key] = query.shift(); // Change value

  // Confirmation of actions
  message.channel.send(`Guild configuration item ${key} has been changed to:\n\`${value}\``);
  message.channel.send("Type `\"undo\"` to undo the changes!");
  const msgs = await message.channel.awaitMessages(msg =>
    msg.content.includes("undo"), {
      time: 3000
    });
  if (msgs.length > 0) {
    message.channel.send("No changes were made to the configuration!")
    return;
  } else {
    message.channel.send("All changes have been saved!");
    settings.set(message.guild.id, config);
  }
}


async function dictThes(url, type, searchQuery, message) {
  // requests lookup
  const response = await lookup.apiRequest(url);
  // parses xml into json
  const json = fastparse.parse(response).entry_list;
  let entries = {
    key: searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)
  }

  if (json.entry) entries.definitions = lookup.format(json);
  if (json.suggestion) entries.suggestion = (Array.isArray(json.suggestion) ? json.suggestion.join("\n - ") : json.suggestion);

  // creates embed
  message.channel.send(utils.createEmbed(entries, type, searchQuery, json));
}