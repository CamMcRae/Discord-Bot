// libs
const fs = require("fs");

// module.exports.<function name> = (arguments) => {
//   return whatever;
// }

// pre: takes in a query for how many to limit a voice channel
// post: voice channel is restricted or no voice channel found
module.exports.restrict = (message, query) => {
  if (message.member.voiceChannel) {
    message.member.voiceChannel.setUserLimit(parseInt(query[0])).then(vc => message.channel.send(`Set user limit to ${vc.userLimit} for ${vc.name}`)).catch(error => {
      console.log(error);
      message.channel.send(":x: Could not restrict channel!");
    });
  } else {
    message.channel.send(":x: Not Connected to Voice");
  }
}

// pre: takes in a channel argument
// post: channel link will be updated in config
module.exports.link = (message, query, config) => {
  if (query.length >= 1) {
    switch (query.shift()) {
      case "music":
        if (config.musicID == message.channel.id) {
          message.channel.send(":link: Channel already linked as music.");
        } else {
          config.musicID = message.channel.id;
          message.channel.send(":link: Channel linked as music.");
        }
        break;
      case "main":
        if (config.mainID == message.channel.id) {
          message.channel.send(":link: Channel already linked as main.");
        } else {
          config.mainId = message.channel.id;
          message.channel.send(":link: Channel linked as main.");
        }
        break;
      default:
    }
    fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
  }
}

// pre:
// post: changes prefix for the bot
module.exports.prefix = (message, query, config) => {
  if (query.join(" ").length == 1) {
    config.prefix = query;
    fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
    message.channel.send("Prefix changed to " + "`" + config.prefix + "`");
  } else {
    message.channel.send("Prefix: " + config.prefix);
  }
}

// pre: takes in a entry list and various other arguments for printing
// post: embed object created for discord to send
module.exports.printMsg = (entries, type, bot, searchQuery, json) => {
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
    case "lunch":
      obj.embed.title = "Lunch Menu"
      obj.embed.description = searchQuery;
      obj.embed.color = 0x1FFF00;
      obj.embed.footer.text = "Lunch Menu";
      // obj.embed.thumbnail = {
      //   url: "./assets/Food.png"
      // }

      for (let i = 0; i < entries.length; i++) {
        obj.embed.fields.push({});

        let temp = "";
        temp += "**" + entries[i].shift() + "** ";
        obj.embed.fields[i].name = temp;

        temp = "";
        temp = entries[i].shift();
        for (let j of entries[i]) {
          temp += "\n_" + j + "_";
        }
        obj.embed.fields[i].value = temp;
      }
      break;
  }
  return obj;
}


// async function google(message, query) {
//   let googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
//   return snekfetch.get(googleUrl).then((result) => {
//     let $ = cheerio.load(result.text); // Parse HTML
//     let googleData = $('.r').first().find('a').first().attr('href');
//     googleData = querystring.parse(googleData.replace('/url?', ''));
//     message.channel.send(`Result found!\n${googleData.q}`);
//   }).catch((err) => { // No results
//     message.channel.send('No results found!');
//   });
// }