// pre:
// post:
module.exports.run = (client, message, query) => {
  let rolls = [];
  let diceAmt;
  try {
    diceAmt = parseInt(query.shift());
  } catch (err) {
    message.channel.send("Invalid arguments");
    return;
  }
  let sides = parseInt(query.shift()) || 6;
  for (let i = 0; i < diceAmt; i++) {
    rolls.push(Math.floor(Math.random() * Math.floor(sides) + 1));
  }
  message.channel.send("The dice landed on: " + rolls.join(", ") + " with a total sum of " + rolls.reduce((a, b) => a + b, 0)).catch("Ya dun did something and it no work.");
}