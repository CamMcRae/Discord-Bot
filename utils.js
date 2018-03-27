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
}
