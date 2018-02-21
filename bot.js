const Discord = require('discord.js');
const xml2js = require('xml2js');
const https = require('https');
const bot = new Discord.Client();
const prefix = "$";
const dictKey = process.env.DICT_TOKEN;
const thesKey = process.env.THES_TOKEN;

bot.on('ready', () => {
  console.log('I am ready!');
  bot.user.setUsername("Bot Dude");
});

bot.on('message', message => {
  if (message.content.startsWith(prefix + "restrict") && message.auther.hasPermission("ADMINISTRATOR")) {
    message.channel.send('wat');
    // message.author.voiceChannel.setUserLimit(message.content.substr(10));
  } else if (message.content === 'ping') {
    message.channel.send('pong');
  } else if (message.content === 'pong') {
    message.channel.send('hah you suck');
  } else if (message.content.startsWith(prefix + "lmgtfy")) {
    message.channel.send("http://lmgtfy.com/?q=" + message.content.substr(8).replace(/ /g, "%20"));
  } else if (message.content.startsWith(prefix + "define")) {
    let query = message.content.substr(8).trim().replace(/ /g, "_").toLowerCase();
    let url = `https://www.dictionaryapi.com/api/v1/references/collegiate/xml/${query} ?key= ${dictKey}`;
    console.log(url);
    apiRequest(url, "dict", dictionary);
  } else if (message.content.startsWith(prefix + "this bot sucks")) {
    message.channel.send("No it doesn't");
  }
  //else if (message.content.startsWith(prefix + "thesaurus")) {
  //   let query = message.content.substr(8, len(message.content.trim() - 2)).trim().replace(/ /g, "_").lowercased();
  // } else if (message.content.startsWith(prefix + "clean")) {
  //   while (true) {
  //     //go up through bot messages and delete them until 1 day old
  //     break;
  //   }
});


bot.login(process.env.BOT_TOKEN);

function dictionary(json, type) {
  let entries = [];
  for (let i in json.entry) {
    for (let j of json.entry[i].def) {
      if (j.dt[0].sx) {
        break;
      } else {
        for (k of j.dt) {
          entries.push(" - ");
          entries.push(k.slice(1));
          entries.push("\n");
        }
      }
    }
  }
  message.send("Something Something.... Im trying my best here hold on");//entries.join(""));
  // let embed = printMsg(entries, json, type);
}


// goes through json for dictionary entries
function printMsg(entries, json, type) {
  console.log("printmsg");
  let obj = {
    embed: {
      thumbnail: {
        url: "https://cdn.discordapp.com/embed/avatars/0.png"
      },
      author: {
        name: client.user.username,
        icon_url: client.user.avatarURL
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
      let word = json.entry[0].ew["#text"];
      obj.embed.title = "Definitions for:";
      obj.embed.description = "[word.charAt(0).toUpperCase() + word.slice(1)](http://www.dictionary.com/browse/ + word + ?s=t)";
      obj.embed.color = 3447003;
      obj.embed.text = word.charAt(0).toUpperCase() + word.slice(1);
      if (entries.length > 0) {
        obj.embed.fields[0].value = entries.join("");
      } else {
        obj.embed.fields[0].name = "No entries found for " + query;
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

function apiRequest(url, type, callback) {
  https.get(url, res => {
    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });
    res.on("end", () => {
      console.log(data);
      let json = getJSON(data, type, callback);
    });
  });
}
//   let xhttp = new XMLHttpRequest(); // opens html request
//   xhttp.onreadystatechange = function() { // waits until an xml is returned
//     if (this.readyState == 4 && this.status == 200) {
//       let json = getJSON(this);
//       console.log("got json");
//       callback(json, type);
//     }
//   };
//   xhttp.open("GET", url, true); // opens request
//   xhttp.send(); //starts request
// }

function getJSON(xml, type, callback) {
  let parser = new xml2js.Parser();
  parser.parseString(xml, function(err, result) {
    let json = result.entry_list;
    callback(json, type);
  });
}
