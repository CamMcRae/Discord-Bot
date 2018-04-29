// pre:
// post:
module.exports.run = (client, message, query) => {
  switch (query.length) {
    case 2:
      message.channel.send("The coin landed on " + (Math.random() >= 0.5 ? query[0] : query[1]) + "!");
      break;
    case 0:
      message.channel.send("The coin landed on " + (Math.random() >= 0.5 ? "heads!" : "tails!"));
      break
    default:
      return "Invalid Arguments!"
  }
}