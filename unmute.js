module.exports.run = (client, message, query) => {
  console.log(query);
  if (!query) query = false;
  if (message.member.hasPermission("MUTE_MEMBERS")) {
    message.guild.members.forEach(m => m.setMute(query));
  } else {
    message.guild.members.filter(m => m.id === client.user.id).forEach(m => m.setMute(false));
  }
}