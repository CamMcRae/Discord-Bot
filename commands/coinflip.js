// pre:
// post:
module.exports.run = (client, message, query) => {
  if (query.length > 0) {
    message.channel.send("The coin landed on " + query[Math.floor(Math.random() * query.length)] + "!");
  } else {
    message.channel.send("The coin landed on " + (Math.random() >= 0.5 ? "heads!" : "tails!"));
  }
}