// libs
// const snekfetch = require('snekfetch');

// files
const commands = require("./commands.json");

// other setup items
let bot;

module.exports.setClient = (client) => {
  bot = client
}

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
    }
  }
}

// pre:
// post: changes prefix for the bot
module.exports.prefix = (message, query, config) => {
  if (query.join(" ").length == 1) {
    config.prefix = query;
    message.channel.send("Prefix changed to " + "`" + config.prefix + "`");
  } else {
    message.channel.send("Prefix: " + config.prefix);
  }
}

// pre:
// post: cleans the defined amount of messages, only bot interaction messages or a users messages
module.exports.clean = async (query, message, config) => {
  // maybe get array of sent messages, filter by bot, shift 1 and get ones above?
  if (query.length == 0) { // Purges only bot messages
    const fetched = await message.channel.fetchMessages();
    const botMessages = await fetched.filter(msg => msg.member.id === bot.user.id || msg.content.slice(0, config.prefix.length) == config.prefix).array().slice(0, 100);
    message.channel.bulkDelete(botMessages).catch(error => {
      console.log(error.stack);
      message.channel.send("Error deleting messages!");
    });
    message.channel.send(":recycle: `" + botMessages.length + " ` messages were removed!").then(msg => {
      msg.delete(3000)
    });
  } else if (message.member.roles.find("name", config.adminRole)) { // if its admin
    const user = message.mentions.users.first();
    let amount = !!parseInt(query[0]) ? parseInt(query[0]) : parseInt(query[1]);
    if (!amount) {
      message.channel.send("Specify and amount of messages to delete");
      return;
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
      }).catch(error => {
        console.log(error);
      });;
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
      }).catch(error => {
        console.log(error);
      });;
    }
  }
}

// pre: config is asked for
// post: returns config
module.exports.showconfig = (config) => {
  configKeys = config.map((value, key) => `${key}  :  ${value}`).join("\n");
  return `The following are the server's current configuration: \`\`\`${configKeys}\`\`\``;
}

// pre: user wants to move channels
// post: defined users will be moved to channel
module.exports.moveChannel = (message, query) => {
  query.splice(0, message.mentions.members.size);

  // shortened cases
  switch (query.join(" ")) {
    case "dbd":
      query = ["dead by daylight"];
      break;
    case "csgo":
      query = ["Conter Strik"];
      break;
    case "pubg":
      query = ["PUBG Skwaaadz"];
      break;
    case "rl":
      query = ["Rocket League"];
      break;
    case "general":
      query = ["General Arthur Curry"];
      break;
    case "r1":
    case "r2":
      query = ["Restricted ", query.slice(1)];
      break
    case "hw":
      query = ["Homework"];
      break;
    case "dst":
      query = ["Don't Starve Together"];
      break;
  }

  // finds channel in guild
  const channel = message.guild.channels.find(c =>
    c.name.toLowerCase() == query.join(" ").toLowerCase() &&
    c.type == 'voice'
  );

  // generate member list
  let users;
  if (message.mentions.members.first()) {
    users = message.mentions.members
  } else {
    users = message.author.voiceChannel.members
  }

  // moves mentioned users into selected channel
  if (channel) {
    users.map(m => m.id).forEach(m => message.guild.members.get(m).setVoiceChannel(channel.id));
  } else {
    message.channel.send(":x: Channel not found!");
  }
}

// pre: user creates a poll
// post: creates a poll for a set amount of time
module.exports.poll = (message, query) => {
  let time = query.shift();
  message.channel.send();
}

// pre: takes in a entry list and various other arguments for printing
// post: embed object created for discord to send
// format: [[Title, Description],[[Field Title, Extra], info], [etc...]]
module.exports.createEmbed = (entries, type, searchQuery, json) => {
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
      obj.embed.title = "Definitions for:";
      obj.embed.description = "[" + entries.key.charAt(0).toUpperCase() + entries.key.slice(1) + "](http://www.dictionary.com/browse/" + entries.key.split(" ").join("-") + "?s=t)";
      obj.embed.color = 3447003;
      obj.embed.footer.text = entries.key;

      if (entries.definitions) {
        Object.keys(entries.definitions).forEach(i => {
          obj.embed.fields.push({
            name: entries.definitions[i].name,
            value: entries.definitions[i].definition.join("\n - ").substring(0, entries.definitions[i].definition.join("\n - ").length > 1024 ? temp.substring(0, 1024).lastIndexOf("-") - 2 : temp.length)
          });
        });
      } else {
        // if there are no entries for the input
        obj.embed.fields.push({
          name: "No entries found for " + word,
          value: "\u200b"
        });
        // if a suggested word list is returned
        if (json.suggestion) {
          obj.embed.fields.push({
            name: "Did you mean:",
            value: "\u2060- " + json.suggestion.join("\n - ")
          });
        }
      }
      break;
      // break
      let word = (searchQuery ? searchQuery : json.entry[0].ew.join(""));
      obj.embed.title = "Definitions for:";
      let dictDesc = "[" + word.charAt(0).toUpperCase() + word.slice(1) + "](http://www.dictionary.com/browse/" + word.split(" ").join("-") + "?s=t)";
      obj.embed.description = dictDesc;
      obj.embed.color = 3447003;
      obj.embed.footer.text = word.charAt(0).toUpperCase() + word.slice(1);
      if (entries) {
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
            obj.embed.fields[i].value = temp.substring(0, temp.length > 1024 ? temp.substring(0, 1024).lastIndexOf("-") - 2 : temp.length);
          }
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

      Object.keys(entries).forEach(i => {
        obj.embed.fields.push({
          name: entries[i].name,
          value: "$" + entries[i].usage.join("\n$")
        });
      });
      break;
    case "lunch":
      obj.embed.title = entries.title;
      obj.embed.description = entries.desc;
      obj.embed.fields = entries.fields;
      obj.embed.color = 0x1FFF00;
      obj.embed.footer.text = "Lunch Menu";

      // obj.embed.thumbnail = {
      //   url: "./assets/Food.png"
      // }

      break;
  }
  return obj;
}

module.exports.commandUsage = (cmd, prefix) => {
  return "```\n - " + prefix + commands[cmd].usage.join("\n - " + prefix) + "```";
}