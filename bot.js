// libs
const Discord = require("discord.js");
const xml2js = require("xml2js");
const https = require("https");
const request = require("request");
const fs = require("fs");
const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');
const snekfetch = require('snekfetch');
const querystring = require('querystring');

// files
const bot = new Discord.Client();
const config = require("./config.json");
const points = JSON.parse(fs.readFileSync("./points.json", "utf8"));
const utils = require("./utils.js");
const lookup = require("./lookup.js");

// keys from heroku
const dictKey = process.env.DICT_TOKEN;
const thesKey = process.env.THES_TOKEN;

// other setup items
const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const firstTen = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const words = ["fak", "fuck", "shit", "fuk"];
const commands = [
  ["Let Me Google That For You", config.prefix + "lmgtfy <query>"],
  ["Define", config.prefix + "define <query>"],
  ["Clean Bot Messages", config.prefix + "clean", config.prefix + "purge"],
  ["Spell with Emotes", config.prefix + "spell <query>"],
  ["Wikipedia Page", config.prefix + "wiki <query>"],
  ["Coinflip", config.prefix + "coinflip", config.prefix + "flipacoin"],
  ["Dice Roll", config.prefix + "roll <number of dice> <amount of sides>"],
  ["Google Search", config.prefix + "google <query>", config.prefix + "whatis <query>"],
  ["Lunch Menu", config.prefix + "lunch", config.prefix + "lunch <yesterday/today/tomorrow>", config.prefix + "lunch <day> <month> <year>"]
]; //[[Description, syntax1, syntax2, etc],...]


bot.on('ready', () => {
  console.log('I am ready!');
  bot.user.setPresence({
    game: {
      name: "a game"
    }
  });
  // bot.user.setUsername("Bot Dude");
});

bot.login(process.env.BOT_TOKEN);

bot.on('message', message => {
  if (message.author.bot) return; // if a bot is talking

  let query = message.content.slice(config.prefix.length).trim().split(/ +/g); // gets query
  let command = query.shift().toLowerCase(); // gets command

  // converts query to lowercase;
  if (command != "wiki") {
    for (let i = 0; i < query.length; i++) {
      query[i] = query[i].toLowerCase();
    }
  }

  // point system
  if (!points[message.author.id]) {
    points[message.author.id] = {
      words: 0,
      messages: 0
    };
  }
  points[message.author.id].messages++;
  if (words.some(word => message.content.includes(word))) {
    points[message.author.id].words++;
  }
  fs.writeFile("./points.json", JSON.stringify(config), (err) => console.error);

  // cases
  if (message.content.startsWith(config.prefix)) {
    if (config.ownerId == message.author.id) {
      switch (command) {
        case "test":
          utils.test();
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
        case "swears":
          entries = [];
          for (let i = 0; i < Object.keys(config.counter).length; i++) {
            entries.push([Object.entries(config.counter)[i]]);
          }
          message.channel.send(printMSG(entries, "swears", bot));
          break;
      }
    }
    switch (command) {
      case "commands":
        message.channel.send(utils.printMsg(JSON.parse(JSON.stringify(commands)), "commands", bot));
        break;
      case "lmgtfy":
        message.channel.send("http://lmgtfy.com/?q=" + message.content.substr(8).replace(/ /g, "%20"));
        break;
      case "define":
        let dictSearchQuery = query.join(" ");
        if (dictSearchQuery) {
          let url = `https://www.dictionaryapi.com/api/v1/references/collegiate/xml/${dictSearchQuery.split(" ").join("%20")}?key=${dictKey}`;
          apiRequest(url, "dict", message, dictionary, dictSearchQuery);
        }
        break;
      case "thesaurus":
        let thesSearchQuery = query.join(" ");
        lookup.apiRequest(url, "thes", message, thesaurus, thesSearchQuery);
        break;
      case "purge":
      case "clean":
        message.delete();
        // maybe get array of sent messages, filter by bot, shift 1 and get ones above?
        if (query.length == 0) { // Purges only bot messages
          message.channel.fetchMessages().then((messages) => {
            const botMessages = messages.filter(msg => msg.author.id === bot.user.id).array().slice(0, 100);
            message.channel.bulkDelete(botMessages).catch(error => {
              console.log(error.stack);
              message.channel.send("Error deleting messages!");
            });
            message.channel.send(":recycle: `" + botMessages.length + " ` messages were removed!").then(msg => {
              msg.delete(3000)
            });
          });
        } else if (config.ownerId == message.author.id) { // if its admin
          const user = message.mentions.users.first();
          let amount = !!parseInt(query[0]) ? parseInt(query[0]) : parseInt(query[1]);
          if (!amount) {
            message.channel.send("Specify and amount of messages to delete");
            break;
          }
          if (user) { // if user is specified
            message.channel.fetchMessages().then((messages) => {
              messages = messages.filter(msg => msg.author.id === user.id).array().slice(0, amount);
              message.channel.bulkDelete(messages).catch(error => {
                console.log(error.stack);
                message.channel.send("Error deleting messages!");
              });
              message.channel.send(":recycle: `" + messages.length + " ` messages were removed!").then(msg => {
                msg.delete(3000)
              });
            });
          } else { // if no user is specified
            message.channel.fetchMessages({
              limit: amount
            }).then((messages) => {
              message.channel.bulkDelete(messages).catch(error => {
                console.log(error.stack);
                message.channel.send("Error deleting messages!");
              });
              message.channel.send(":recycle: `" + amount + "` messages were removed!").then(msg => {
                msg.delete(3000)
              });
            });
          }
        }
        break;
      case "spell":
        message.delete();
        let spellTemp = [];
        query = query.join(" ");
        for (let i = 0; i < query.length; i++) {
          if (query[i] != " ") {
            if (alphabet.includes(query[i])) {
              spellTemp.push(":regional_indicator_" + query[i] + ":");
            } else {
              try {
                if (parseInt(query[i]) >= 0 && parseInt(query[i]) < 10) {
                  spellTemp.push(":" + firstTen[parseInt(query[i])] + ":");
                }
              } catch (e) {}

            }
          } else {
            spellTemp.push("     ");
          }
        }
        message.channel.send(spellTemp.join(" "));
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
        if (query.length > 0) {
          message.channel.send("The coin landed on " + (Math.random() >= 0.5 ? query[0] : query[1]) + "!").catch((err) => {
            message.channel.send("Invalid Arguments!")
          });
        } else {
          message.channel.send("The coin landed on " + (Math.random() >= 0.5 ? "heads!" : "tails!"));
        }
        break;
      case "roll":
        let rolls = [];
        let diceAmt;
        try {
          diceAmt = parseInt(query.shift());
        } catch (e) {
          message.channel.send("Invalid arguments");
          diceAmt = 0;
        }
        let max = parseInt(query.shift()) || 6;
        for (let i = 0; i < diceAmt; i++) {
          rolls.push(Math.floor(Math.random() * Math.floor(max) + 1));
        }
        if (rolls.length > 0) {
          message.channel.send("The dice landed on: " + rolls.join(", ") + " with a total sum of " + rolls.reduce((a, b) => a + b, 0)).catch("Ya dun did something and it no work.");
        }
        break;
      // case "google":
      // case "whatis":
      //   google(message, query);
      //   break;
      case "lunch":
        let td = new Date()
        let date;
        if (query.length == 0 || query[0] == "today") { // no query or "today"
          date = `${td.getMonth()+1}/${td.getDate()}/${td.getFullYear()}`
        } else {
          switch (query[0]) {
            case "tomorrow":
              td.setDate(td.getDate() + 1);
              date = `${td.getMonth()+1}/${td.getDate()}/${td.getFullYear()}`
              break;
            case "yesterday":
              td.setDate(td.getDate() - 1);
              date = `${td.getMonth()+1}/${td.getDate()}/${td.getFullYear()}`
              break;
            case "week":
              break;
            default:
              try {
                td = new Date(query[2], query[1] - 1, query[0]);
              } catch (e) {
                message.channel.send("Invalid Arguments provided");
              }
              date = `${td.getMonth()+1}/${td.getDate()}/${td.getFullYear()}`
              break;
          }
        }
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

// url, t/f, t = day;
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
    // console.log(res);

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
      message.channel.send(printMsg(menu, "lunch", bot, (type ? "Daily" : "Weekly")));
    } else {
      message.channel.send("No Lunch for " + date);
    }
  });
}

function dictionary(json, type, message) {
  //goes through json for dictionary entries
  let entries = [];
  for (let i of json.entry) { // main entry loop
    let entry = [];
    for (let j of i.def) { // goes through all definitions of entry
      let header = []; // makes header list with name and date
      header.push(i.ew.join("")); // name
      if (j.date) { // date
        header.push(j.date.join(""));
      }
      entry.push(header);
      for (k of j.dt) { // finds the "dt" key
        if (typeof(k) == "object") { //object
          try {
            let temp = k["_"].substring(k["_"].indexOf(":") + 1);
            if (k.sx) {
              temp += k.sx; // adds anything extra
            }
            entry.push(temp);
          } catch (e) {
            if (typeof(k) == "object") { // logs the words if there is an error
              fs.appendFile("./errorWords.txt", Object.keys(k).map(function(j) {
                return k[j]
              }) + "\n");
            } else {
              fs.appendFile("./errorWords.txt", k);
            }
          }
        } else { //string
          entry.push(k.substring(k.indexOf(":") + 1)); // adds string
        }
      }
    }
    entries.push(entry); // adds one entry to master list
  }
  message.channel.send(printMsg(entries, type, bot, null, json));
}
