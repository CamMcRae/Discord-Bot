const updateConfig = require("../updateConfig.js");

if (process.env.REDISTOGO_URL) {
  let rtg = require("url").parse(process.env.REDISTOGO_URL);
  let redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
}

// pre:
// post: changes prefix for the bot
module.exports.run = (client, message, query, config) => {
  if (query.length == 1) {
    updateConfig.run(message.guild.id, "prefix", query[0], redis)
    redis.get((message.guild.id).toString(), (err, result) => {
      message.channel.send("Prefix changed to " + "`" + JSON.parse(result).prefix + "`");
    });
  }
}