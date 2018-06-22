// pre: string input
// post: lmgtfy link sent
module.exports.run = (client, message, query) => {
  message.channel.send("http://lmgtfy.com/?q=" + message.content.substr(8).replace(/ /g, "%20"));
}