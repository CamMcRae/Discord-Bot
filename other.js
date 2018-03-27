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
