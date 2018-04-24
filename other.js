// other setup items
const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const firstTen = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];


module.exports.coinflip = (query) => {
  switch (query.length) {
    case 2:
      return "The coin landed on " + (Math.random() >= 0.5 ? query[0] : query[1]) + "!";
      break;
    case 0:
      return "The coin landed on " + (Math.random() >= 0.5 ? "heads!" : "tails!");
      break
    default:
      return "Invalid Arguments!"
  }
}

module.exports.rollDice = (query, message) => {
  let rolls = [];
  let diceAmt;
  try {
    diceAmt = parseInt(query.shift());
  } catch (e) {
    message.channel.send("Invalid arguments");
    diceAmt = 0;
  }
  let max = parseInt(query.shift()) || 6;
  for (let i = 0; i < diceAmt; i++) {
    rolls.push(Math.floor(Math.random() * Math.floor(max) + 1));
  }
  if (rolls.length > 0) {
    message.channel.send("The dice landed on: " + rolls.join(", ") + " with a total sum of " + rolls.reduce((a, b) => a + b, 0)).catch("Ya dun did something and it no work.");
  }
}

module.exports.spell = (query, message) => {
  message.delete();
  let spellTemp = [];
  query = query.join(" ");
  for (let i = 0; i < query.length; i++) {
    if (query[i] != " ") {
      if (alphabet.includes(query[i])) {
        spellTemp.push(":regional_indicator_" + query[i] + ":");
      } else {
        try {
          if (parseInt(query[i]) >= 0 && parseInt(query[i]) < 10) {
            spellTemp.push(":" + firstTen[parseInt(query[i])] + ":");
          }
        } catch (e) {}

      }
    } else {
      spellTemp.push("     ");
    }
  }
  message.channel.send(spellTemp.join(" "));
}