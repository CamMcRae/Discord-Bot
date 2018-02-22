const Discord = require('discord.js');
const xml2js = require('xml2js');
const https = require('https');
const bot = new Discord.Client();
const prefix = "$";
const dictKey = process.env.DICT_TOKEN;
const thesKey = process.env.THES_TOKEN;
const mainChannel = null;

bot.on('ready', () => {
  console.log('I am ready!');
  bot.user.setUsername("Bot Dude");
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
        apiRequest(url, "dict", message, dictionary);
        break;
      case "thesaurus":
        let thesSearchQuery = query.join(" ").toLowerCase();
        // thesaurus
        break;
      case "this bot sucks":
        message.channel.send("No it doesn't");
        break;
      case "link":
        mainChannel = message.channel;
      case "prefix":
        if (message.author.hasPermission("ADMINISTRATOR") && query.length == 1) {
          prefix = query;
        }
        break;
      case "clean":
        // go up through bot messages and delete them until 1 day old
        break;
    }
  } else {
    switch (message.content) {
      case "ping":
        message.channel.send('pong');
      case "pong":
        message.channel.send('hah you suck');
    }
  }
});

bot.login(process.env.BOT_TOKEN);

function dictionary(json, type, message) {
  let entries = [];
  for (let i in json.entry) {
    for (let j of json.entry[i].def) {
      if (j.dt[0].sx) {
        break;
      } else {
        for (k of j.dt) {
          try {
            k.substring(k.indexOf(":") + 1);
            entries.push(" - ");
            entries.push(k.substring(k.indexOf(":") + 1));
            entries.push("\n");
          } catch (e) {

          }
        }
      }
    }
  }
  // message.channel.send("Something Something.... Im trying my best here hold on"); //entries.join(""));
  let embed = printMsg(entries, json, type);
  message.channel.send(embed);
}

// goes through json for dictionary entries
function printMsg(entries, json, type) {
  let obj = {
    embed: {
      thumbnail: {
        url: "https://dictionary.com"
      },
      author: {
        name: bot.user.username,
        icon_url: bot.user.avatarURL
      },
      footer: {
        icon_url: "https://cdn.discordapp.com/embed/avatars/0.png"
      },
      timestamp: new Date(),
      fields: [{
        name: "Entries"
      }]
    }
  };
  switch (type) {
    case "dict": //dictionary entry
      let word = json.entry[0].ew.join("");
      obj.embed.title = "Definitions for:";
      let desc = "[" + word.charAt(0).toUpperCase() + word.slice(1) + "](http://www.dictionary.com/browse/" + word + "?s=t)";
      obj.embed.description = desc;
      obj.embed.color = 3447003;
      obj.embed.footer.text = word.charAt(0).toUpperCase() + word.slice(1);
      if (entries.length > 0) {
        obj.embed.fields[0].value = entries.join("");
      } else {
        obj.embed.fields[0].name = "No entries found for " + dictSearchQuery;
        obj.embed.fields[0].value = "\u200b";
      }
      break;
    case "thes":
      let word2 = json.entry[0].ew["#text"];
      obj.embed.title = "Synonyms for:";
      obj.embed.description = "[word.charAt(0).toUpperCase() + word.slice(1)](http://www.dictionary.com/browse/ + word + ?s=t)";
      obj.embed.color = 15105570;
      obj.embed.text = word.charAt(0).toUpperCase() + word.slice(1);
      break;
  }
  return obj;
}

function apiRequest(url, type, message, callback) {
  https.get(url, res => {
    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });
    res.on("end", () => {
      let json = getJSON(data, type, message, callback);
    });
  });
}

function getJSON(xml, type, message, callback) {
  let parser = new xml2js.Parser();
  parser.parseString(xml, function(err, result) {
    let json = result.entry_list;
    callback(json, type, message);
  });
}
