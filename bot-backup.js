// libs
const Discord = require("discord.js");
const fastparse = require('fast-xml-parser');
const https = require("https");
const request = require("request");
const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');
const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');

// files
const bot = new Discord.Client();
const utils = require("./utils.js");
const lookup = require("./lookup.js");
const other = require("./other.js");
const lunch = require("./lunchMenu.js");

// keys from heroku
const dictKey = process.env.DICT_TOKEN;
const thesKey = process.env.THES_TOKEN;

// other setup items
const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const firstTen = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const words = ["fak", "fuck", "shit", "fuk"];

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

bot.login(process.env.BOT_TOKEN);

bot.on('message', message => {
  if (!message.guild || message.author.bot) return; // if a bot is talking or not a server
  // console.log(message);
  const config = {
    prefix: "$",
    adminRole: "Administrator",
    admin: "124349142708387840"
  }

  // const config = settings.get(message.guild.id);

  let query = message.content.slice(config.prefix.length).trim().split(/ +/g); // gets query
  const command = query.shift().toLowerCase(); // gets command

  // converts query to lowercase;
  if (command != "wiki") {
    for (let i = 0; i < query.length; i++) {
      query[i] = query[i].toLowerCase();
    }
  }

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
  if (message.content.startsWith(config.prefix)) {
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
        case "move":
          if (!message.mentions.users.first()) {
            message.channel.send(":x: Mention who you want to move.");
            break;
          }
          utils.moveChannel(message, query);
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
      case "commands":
        const commands = [
          ["Let Me Google That For You", config.prefix + "lmgtfy <query>"],
          ["Define", config.prefix + "define <query>"],
          ["Clean Bot Messages", config.prefix + "clean", config.prefix + "purge"],
          ["Spell with Emotes", config.prefix + "spell <query>"],
          ["Wikipedia Page", config.prefix + "wiki <query>"],
          ["Coinflip", config.prefix + "coinflip", config.prefix + "flipacoin"],
          ["Dice Roll", config.prefix + "roll <number of dice> <amount of sides>"],
          // ["Google Search", config.prefix + "google <query>", config.prefix + "whatis <query>"],
          ["Lunch Menu", config.prefix + "lunch", config.prefix + "lunch <yesterday/today/tomorrow>", config.prefix + "lunch <day> <month> <year>"]
        ]; //[[Description, syntax1, syntax2, etc],...]
        message.channel.send(utils.createEmbed(JSON.parse(JSON.stringify(commands)), "commands"));
        break;
      case "lmgtfy":
        message.channel.send("http://lmgtfy.com/?q=" + message.content.substr(8).replace(/ /g, "%20"));
        break;
      case "define":
        let dictSearchQuery = query.join(" ");
        if (dictSearchQuery) {
          let url = `https://www.dictionaryapi.com/api/v1/references/collegiate/xml/${dictSearchQuery.split(" ").join("%20")}?key=${dictKey}`;
          message.channel.send(dictThes(url, "dict", dictSearchQuery, message));
        }
        break;
      case "thesaurus":
        let thesSearchQuery = query.join(" ");
        if (thesSearchQuery) {
          let url = `https://www.dictionaryapi.com/api/v1/references/collegiate/xml/${thesSearchQuery.split(" ").join("%20")}?key=${dictKey}`;
          dictThes(url, "thes", thesSearchQuery, message);
        }
        break;
      case "purge":
      case "clean":
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
      case "wiki":
        message.channel.send("https://en.wikipedia.org/wiki/" + query.split(" ").join("_"));
        break;
      case "coinflip":
      case "flipacoin":
        message.channel.send(other.coinflip(query));
        break;
      case "roll":
        other.rollDice(query, message);
        break;
      case "google":
      case "whatis":
        utils.google(message, query);
        break;
      case "lunch":
        const date = lunch.createDate(query, message);
        console.log(date);
        if (date) {
          lunch(date, true, message);
        }
        // link: https://menu2.danahospitality.ca/hsc/menu.asp?r=1&ShowDate=1/26/2018
        break;
    }
  } else {
    if (message.content.startsWith("r/")) {
      message.delete();
      message.channel.send("https://www.reddit.com/" + message.content.trim());
    }
    switch (message.content.toLowerCase()) {
      case "ping":
        message.channel.send('pong');
      case "pong":
        message.channel.send('hah you suck');
        break;
      case "r u kidding me right now":
        message.channel.send("No im not");
        break;
      case "this bot sucks":
        message.channel.send("No it doesn't");
        break;
    }
  }
});

// date, t/f, t = day;
function lunch(date, type, message) {
  let url = `https://menu2.danahospitality.ca/hsc/menu.asp?r=1&ShowDate=${date}`;
  request(url, function(error, response, body) {
    let $ = cheerio.load(body); // load html
    let frame = {
      "menu": {
        _s: "tr",
        _d: [{
          "type": ".MenuSection",
          "name": ".ItemName .ItemName",
          "desc": ".ItemDescription"
        }]
      }
    }
    jsonframe($); // parse and scrape html
    var res = $('tbody').scrape(frame);

    // creates entries for embed
    let menu = [];
    let menuTemp = [];
    for (let i of res.menu) { // each item of list
      if (menuTemp.length > 1) {
        menuTemp = [];
      }
      if (Object.keys(i) == "type") {
        menuTemp.push(i.type) // header
      } else {
        for (let j of Object.keys(i)) {
          menuTemp.push(i[j]); // name and description
        }
      }
      if (menuTemp.length != 1) { // only pushes if there is more than just a name
        menu.push(menuTemp);
      }
    }

    // sends to embed maker
    if (menu.length > 0) {
      message.channel.send(utils.createEmbed(menu, "lunch", (type ? "Daily" : "Weekly")));
    } else {
      message.channel.send("No Lunch for " + date);
    }
  });
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
  let json = fastparse.parse(response).entry_list;
  let entries;
  if (json.entry) {
    if (type == "dict") {
      entries = lookup.dictionary(json);
    } else if (type == "thes") {
      entries = lookup.dictionary(json);
    }
  }
  // creates embed
  message.channel.send(utils.createEmbed(entries, type, searchQuery, json));
}