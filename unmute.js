module.exports.run = (client, message, query) => {
  if (!query.length) query = [false];
  if (message.member.hasPermission("MUTE_MEMBERS")) {
    message.guild.members.forEach(m => m.setMute(query[0]));
  } else {
    message.guild.members.filter(m => m.id === client.user.id).forEach(m => m.setMute(false));
  }
}