// files
const createEmbed = require("./createEmbed.js");
const commands = require("../commands.json")

// pre:
// post: embed with commands sent
module.exports.run = (client, message, query) => {
  message.channel.send(createEmbed.run(commands, "commands"));
}