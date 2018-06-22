module.exports.run = (client, message, query) => {
  // makes sure user is in mentioned users
  if (!message.member.roles.find("name", config.adminRole)) {
    if (!message.mentions.users.find(user => user.id == message.member.id)) {
      return
    }
    // makes sure someone is mentioned
    if (!message.mentions.users.first()) {
      message.channel.send(":x: Mention who you want to move.\n - " + commands.move.usage.join("\n - "));
      return
    }

    // makes sure member is in a voice channel
    if (!message.member.voiceChannel) {
      message.channel.send(":x: You need to be in a voice channel to use this command.");
      return
    }
  }

  // gets channel
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
    c.type == 'voice' &&
    !c.full
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
    users.map(m => m.id).forEach(m => {
      if (!channel.full) {
        if (m.voiceChannel === message.author.voiceChannel) {
          message.guild.members.get(m).setVoiceChannel(channel.id)
        }
      }
    });
  } else {
    message.channel.send(":x: Channel not found!");
  }
}