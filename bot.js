const Discord = require('discord.js');
const bot = new Discord.Client();
const prefix = "$";
const dictKey = process.env.DICT_TOKEN;
const thesKey = process.env.THES_TOKEN;
let https = require('https');

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
    console.log(query);
    let url = `https://www.dictionaryapi.com/api/v1/references/collegiate/xml/ + ${query} +?key= + ${dictKey}`;
    apiRequest(url, "dict", dictionary);
  } else if (message.content === (prefix + "this bot sucks ass")) {
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
  console.log("dictStart");
  let entries = [];
  for (let i in json.entry) {
    for (let j of json.entry[i].def.dt) {
      if (j.sx) {
        break;
      } else {
        entries.push(" - ");
        entries.push(j["#text"].slice(1));
        entries.push("\n");
      }
    }
  }
  let embed = printMsg(entries, json, type);
  console.log("dictEnd");
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
  let req = https.request(url, (resp) => {
    let data = '';
  });
  req.on('data', (chunk) => {
    data += chunk;
    console.log(data + "data");
  });
  req.end();
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

function getJSON(xml) {
  let xmlDoc = new DOMParser().parseFromString(xml.responseText, 'text/xml');
  let x = xmlDoc.getElementsByTagName('entry_list')[0];
  let json = xmlToJson(x);
  return json;
}

function xmlToJson(xml) {
  var obj = {};
  if (xml.nodeType == 1) { // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj["attributes"] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj["attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) { // text
    obj = xml.nodeValue;
  }

  // do children
  if (xml.hasChildNodes()) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof(obj[nodeName]) == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof(obj[nodeName].push) == "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
};
