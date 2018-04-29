// files
const createEmbed = require("./createEmbed.js");

module.exports.run = (client, message, query) => {
  message.channel.send(createEmbed.run(commands, "commands"));
}