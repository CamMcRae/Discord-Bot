const Discord = require("discord.js");
const xml2js = require("xml2js");
const https = require("https");
const fs = require("fs");
const cheerio = require('cheerio');
const snekfetch = require('snekfetch');
const querystring = require('querystring');
const bot = new Discord.Client();
const config = require("./config.json");
const dictKey = process.env.DICT_TOKEN;
const thesKey = process.env.THES_TOKEN;
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
  ["Google Search", config.prefix + "google <query>", config.prefix + "whatis <query>"]
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

  // counter
  if (words.some(word => message.content.includes(word))) {
    config.counter[message.author.id]++;
    fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
  }

  // cases
  if (message.content.startsWith(config.prefix)) {
    if (config.ownerId == message.author.id) {
      switch (command) {
        case "restrict":
          message.channel.send('wat');
          console.log(message)
          break;
        case "link":
          switch (query.shift()) {
            case "music":
              config.musicID = message.channel.id;
              message.channel.send(":link: Channel linked as music.");
              break;
            case "main":
              config.mainId = message.channel.id;
              message.channel.send(":link: Channel linked as main.");
              break;
            default:
              fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
          }
          break;
        case "prefix":
          if (query.join(" ").length == 1) {
            config.prefix = query;
            fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
            message.channel.send("Prefix changed to " + "```" + config.prefix + "```");
          }
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
        message.channel.send(printMsg(commands => {
          return commands.slice(0);
        }, "commands"));
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
        apiRequest(url, "thes", message, thesaurus, thesSearchQuery);
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
            message.channel.send("`" + botMessages.length + ":recycle: ` messages were removed!").then(msg => {
              msg.delete(5000)
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
              message.channel.send("`" + messages.length + ":recycle: ` messages were removed!").then(msg => {
                msg.delete(5000)
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
                msg.delete(5000)
              });
            });
          }
        }
        break;
      case "spell":
        message.delete();
        let spellTemp = [];
        for (let i = 0; i < query.join(" ").length; i++) {
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
        message.channel.send("The coin landed on " + (Math.random() >= 0.5 ? "heads!" : "tails!"))
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
      case "google":
      case "whatis":
        google(message, query);
        break;
    }
  } else {
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

async function google(message, query) {
  let googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  return snekfetch.get(googleUrl).then((result) => {
    let $ = cheerio.load(result.text); // Parse HTML
    let googleData = $('.r').first().find('a').first().attr('href');
    googleData = querystring.parse(googleData.replace('/url?', ''));
    message.channel.send(`Result found!\n${googleData.q}`);
  }).catch((err) => { // No results
    message.channel.send('No results found!');
  });
}

function apiRequest(url, type, message, callback, searchQuery) {
  https.get(url, res => { // calls api
    let data = '';
    res.on('data', chunk => { // when data is recieved
      data += chunk;
    });
    res.on("end", () => { // when call if finished
      let json = getJSON(data, type, message, callback, searchQuery);
    });
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
  message.channel.send(printMsg(entries, type, null, json));
}

function printMsg(entries, type, searchQuery, json) {
  // default object creation
  let obj = {
    embed: {
      thumbnail: {
        url: "https://cdn.discordapp.com/embed/avatars/0.png"
      },
      author: {
        name: bot.user.username,
        icon_url: bot.user.avatarURL
      },
      footer: {
        icon_url: "https://cdn.discordapp.com/embed/avatars/0.png"
      },
      timestamp: new Date(),
      fields: []
    }
  };
  switch (type) {
    case "dict": //dictionary entry
      let word = (searchQuery ? searchQuery : json.entry[0].ew.join(""));
      obj.embed.title = "Definitions for:";
      let dictDesc = "[" + word.charAt(0).toUpperCase() + word.slice(1) + "](http://www.dictionary.com/browse/" + word.split(" ").join("-") + "?s=t)";
      obj.embed.description = dictDesc;
      obj.embed.color = 3447003;
      obj.embed.footer.text = word.charAt(0).toUpperCase() + word.slice(1);
      if (entries.length > 0) {
        for (let i = 0; i < entries.length; i++) { // first list element with name and date
          obj.embed.fields.push({});
          let temp = "";
          temp += "**" + entries[i][0].shift() + "** ";
          if (entries[i][0].length > 0) {
            temp += "[" + entries[i][0].shift() + "]";
          }
          obj.embed.fields[i].name = temp; // adds to embed
          entries[i].shift(); // removes list
          temp = "\u2060";
          for (let j of entries[i]) { // adds each element
            temp += " - " + j.trim() + "\n";
          }
          obj.embed.fields[i].value = temp;
        }
      } else {
        // if there are no entries for the input
        obj.embed.fields.push({});
        obj.embed.fields[0].name = "No entries found for " + word;
        obj.embed.fields[0].value = "\u200b";
        // if a suggested word list is returned
        if (json.suggestion) {
          obj.embed.fields.push({});
          obj.embed.fields[1].name = "Did you mean:"
          obj.embed.fields[1].value = "\u2060- " + json.suggestion.join("\n - ")
        }
      }
      break;
    case "thes":
      let word2 = (searchQuery ? searchQuery : json.entry[0].ew.join(""));
      obj.embed.title = "Synonyms for:";
      let thesDesc = "[" + word.charAt(0).toUpperCase() + word.slice(1) + "](http://www.thesaurus.com/browse/" + word + "?s=ts)";
      obj.embed.description = thesDesc;
      obj.embed.color = 15105570;
      obj.embed.footer.text = word.charAt(0).toUpperCase() + word.slice(1);
      if (entries.length > 0) {
        for (let i = 0; i < entries.length; i++) {
          obj.embed.fields[i].name = "*" + entries[i].shift() + "*";
          obj.embed.value = entries.join("\n - ");
        }
      } else {
        obj.embed.fields[0].name = "No entries found for " + word;
        obj.embed.fields[0].value = "\u200b";
      }
      break;
    case "swears":
      obj.embed.title = "Swear Counter";
      let swearDesc = entries.shift() + "is in the lead."
      obj.embed.description = thesDesc;
      obj.embed.fields.push({});
      obj.embed.fields[0].name = "Counter";
      let temp = "";
      for (let i = 0; i < entries.length; i++) {
        temp += client.users.get(entries[i][0]); + ": " + entries[i][1] + "\n";
      }
      obj.embed.fields[0].value = temp;
      obj.embed.footer.text = "\u200b";
      obj.embed.color = 0xff00ff;
      break;
    case "commands":
      obj.embed.title = "Commands for " + bot.user.username;
      obj.embed.description = "<Usage>";
      obj.embed.color = 0xff0909;
      obj.embed.footer.text = "Commands";

      for (let i = 0; i < entries.length; i++) { // first list element with name and date
        obj.embed.fields.push({});
        let temp = "";
        temp += "**" + entries[i].shift() + "** ";
        obj.embed.fields[i].name = temp; // adds to embed
        obj.embed.fields[i].value = entries[i].join("\n");
      }
      break;
  }
  return obj;
}

function getJSON(xml, type, message, callback, searchQuery) {
  let parser = new xml2js.Parser();
  parser.parseString(xml, function(err, result) { // converts xml to json
    let json = result.entry_list;
    if (json.entry) { // if there are valid entries
      callback(json, type, message);
    } else { // if no valid entries
      message.channel.send(printMsg([], type, searchQuery, json));
    }
  });
}
