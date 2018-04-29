// other items
const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const firstTen = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

// pre: string input
// post: turned to emojis if possible
module.exports.run = (client, message, query) => {

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