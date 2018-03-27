module.exports.coinflip = (query) => {
  if (query.length > 0) {
    return ("The coin landed on " + (Math.random() >= 0.5 ? query[0] : query[1]) + "!").catch((err) => {
      return "Invalid Arguments!"
    });
  } else {
    return "The coin landed on " + (Math.random() >= 0.5 ? "heads!" : "tails!");
  }
}
