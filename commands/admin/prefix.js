if (process.env.REDISTOGO_URL) {
  let rtg = require("url").parse(process.env.REDISTOGO_URL);
  let redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
}

// pre:
// post: changes prefix for the bot
module.exports.run = (message, query, config) => {
  if (query.length == 1) {
    redis.set(message.guild.id.prefix, query);
    message.channel.send("Prefix changed to " + "`" + message.guild.id.prefix + "`");
  }
}