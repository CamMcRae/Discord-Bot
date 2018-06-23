const updateConfig = require("../updateConfig.js");

// pre:
// post: changes prefix for the bot
module.exports.run = (client, message, query, config, redis) => {
  if (query.length == 1) {
    updateConfig.run(message.guild.id, "prefix", query[0], redis);
    redis.get((message.guild.id).toString(), (err, result) => {
      message.channel.send("Prefix changed to " + "`" + JSON.parse(result).prefix + "`");
    });
  }
}