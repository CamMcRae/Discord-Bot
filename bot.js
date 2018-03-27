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
const other = require("./other.js");

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
  // ["Google Search", config.prefix + "google <query>", config.prefix + "whatis <query>"],
  ["Lunch Menu", config.prefix + "lunch", config.prefix + "lunch <yesterday/today/tomorrow>", config.prefix + "lunch <day> <month> <year>"]
]; //[[Description, syntax1, syntax2, etc],...]


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
          utils.test(message);
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
          message.channel.send(printMSG(entries, "swears"));
          break;
      }
    }
    switch (command) {
      case "commands":
        message.channel.send(utils.printMsg(JSON.parse(JSON.stringify(commands)), "commands"));
        break;
      case "lmgtfy":
        message.channel.send("http://lmgtfy.com/?q=" + message.content.substr(8).replace(/ /g, "%20"));
        break;
      case "define":
        let dictSearchQuery = query.join(" ");
        if (dictSearchQuery) {
          let url = `https://www.dictionaryapi.com/api/v1/references/collegiate/xml/${dictSearchQuery.split(" ").join("%20")}?key=${dictKey}`;
          lookup.apiRequest(url, "dict", message, lookup.dictionary, dictSearchQuery);
        }
        break;
      case "thesaurus":
        let thesSearchQuery = query.join(" ");
        if (thesSearchQuery){
          let url;
        }
        lookup.apiRequest(url, "thes", message, thesaurus, thesSearchQuery);
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
      message.channel.send(utils.printMsg(menu, "lunch", (type ? "Daily" : "Weekly")));
    } else {
      message.channel.send("No Lunch for " + date);
    }
  });
}
