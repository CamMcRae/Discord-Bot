// pre:
// post: changes prefix for the bot
module.exports.run = (message, query, config) => {
  if (query.length == 1) {
    config.prefix = query;
    message.channel.send("Prefix changed to " + "`" + config.prefix + "`");
  } else {
    message.channel.send("Prefix: " + config.prefix);
  }
}