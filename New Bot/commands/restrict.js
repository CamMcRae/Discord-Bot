// pre: takes in a query for how many to limit a voice channel
// post: voice channel is restricted or no voice channel found
module.exports.run = (client, message, query) => {

  if (!message.member.voiceChannel) {
    message.channel.send(":x: Not Connected to Voice");
    return
  }

  message.member.voiceChannel.setUserLimit(parseInt(query[0]))
    .then(vc => message.channel.send(`Set user limit to ${vc.userLimit} for ${vc.name}`))
    .catch(error => {
      console.log(error);
      message.channel.send(":x: Could not restrict channel!");
    });

}