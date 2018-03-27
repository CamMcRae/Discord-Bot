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
