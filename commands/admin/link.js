const updateConfig = require("../updateConfig.js");

// pre: takes in a channel argument
// post: channel link will be updated in config
module.exports.run = (client, message, query, config) => {
  if (query.length == 1) {
    switch (query.shift()) {
      case "music":
        if (config.musicID == message.channel.id) {
          message.channel.send(":link: Channel already linked as music.");
        } else {
          updateConfig.run((message.guild.id).toString(), "musicID", message.channel.id);
          message.channel.send(":link: Channel linked as music.");
        }
        break;
      case "main":
        if (config.mainID == message.channel.id) {
          message.channel.send(":link: Channel already linked as main.");
        } else {
          updateConfig.run((message.guild.id).toString(), "mainID", message.channel.id);
          message.channel.send(":link: Channel linked as main.");
        }
        break;
    }
  }
}