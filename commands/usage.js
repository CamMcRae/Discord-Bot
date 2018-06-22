module.exports.run = (cmd, prefix) => {
  return "```\n - " + prefix + commands[cmd].usage.join("\n - " + prefix) + "```";
}