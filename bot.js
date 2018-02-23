const Discord = require('discord.js');
const xml2js = require('xml2js');
const https = require('https');
const fs = require("fs");
const bot = new Discord.Client();
const config = require("./config.json");
let prefix = config.prefix;
const dictKey = process.env.DICT_TOKEN;
const thesKey = process.env.THES_TOKEN;
let message = {
  content: "",
  author: ""
};

bot.on('ready', () => {
  console.log('I am ready!');
  // bot.user.setUsername("Bot Dude");
});

bot.on('message', message => {
  if (message.author.bot) return;
  const query = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = query.shift().toLowerCase();
  if (message.content.startsWith("$")) {
    switch (command) {
      case "restrict":
        message.channel.send('wat');
        break;
      case "lmgtfy":
        message.channel.send("http://lmgtfy.com/?q=" + message.content.substr(8).replace(/ /g, "%20"));
        break;
      case "define":
        let dictSearchQuery = query.join(" ").toLowerCase();
        let url = `https://www.dictionaryapi.com/api/v1/references/collegiate/xml/${dictSearchQuery}?key=${dictKey}`;
        apiRequest(url, "dict", message, dictionary, dictSearchQuery);
        break;
      case "thesaurus":
        let thesSearchQuery = query.join(" ").toLowerCase();
        apiRequest(url, "thes", message, thesaurus, thesSearchQuery);
        // thesaurus
        break;
      case "this bot sucks":
        message.channel.send("No it doesn't");
        break;
      case "link":
        if (message.author.id == config.ownerId) {
          switch (query) {
            case "music":
              config.musicID = message.channel;
              break;
            case "main":
              config.mainId = message.channel;
              break;
            default:
              fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
          }
        }
      case "prefix":
        if (message.author.id == config.ownerId && query.length == 1) {
          config.prefix = query;
          prefix = config.prefix;
          fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
          message.channel.send("Prefix changed to " + "```" + config.prefix + "```");
        }
        break;
      case "clean":
        // go up through bot messages and delete them until 1 day old
        break;
    }
  } else {
    switch (message.content.toLowerCase()) {
      case "ping":
        message.channel.send('pong');
      case "pong":
        message.channel.send('hah you suck');
    }
  }
});

bot.login(process.env.BOT_TOKEN);

function apiRequest(url, type, message, callback, searchQuery) {
  https.get(url, res => {
    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });
    res.on("end", () => {
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
          let temp = k["_"].substring(k["_"].indexOf(":") + 1);
          if (k.sx) {
            temp += k.sx;
          }
          entry.push(temp);
        } else { //string
          entry.push(k.substring(k.indexOf(":") + 1));
        }
      }
    }
    entries.push(entry);
  }
  message.channel.send(printMsg(entries, type, null, json));
}

// goes through json for dictionary entries
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
      let dictDesc = "[" + word.charAt(0).toUpperCase() + word.slice(1) + "](http://www.dictionary.com/browse/" + word + "?s=t)";
      obj.embed.description = dictDesc;
      obj.embed.color = 3447003;
      obj.embed.footer.text = word.charAt(0).toUpperCase() + word.slice(1);
      if (entries.length > 0) {
        for (let i = 0; i < entries.length; i++) { // first list element with name and date
          obj.embed.fields.push({});
          let temp = " ";
          temp += "**" + entries[i][0].shift() + "** ";
          if (entries[i][0].length > 0) {
            temp += "_" + entries[i][0].shift() + "_";
          }
          obj.embed.fields[i].name = temp; // adds to embed
          entries[i].shift(); // removes list
          temp = "";
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
          obj.embed.fields[1].value = "  - " + json.suggestion.join("\n - ")
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
  }
  return obj;
}

function getJSON(xml, type, message, callback, searchQuery) {
  let parser = new xml2js.Parser();
  parser.parseString(xml, function(err, result) {
    let json = result.entry_list;
    if (json.entry) {
      callback(json, type, message);
    } else {
      message.channel.send(printMsg([], type, searchQuery, json));
    }
  });
}
