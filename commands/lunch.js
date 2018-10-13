const createEmbed = require("./createEmbed.js");
const lunch = require('./lunch.js');

// libs
const cheerio = require('cheerio');
const requestpromise = require("request-promise");
const fastparse = require('fast-xml-parser');
const jsonframe = require('jsonframe-cheerio');


module.exports.run = async (client, message, query) => {
  const date = createDate(query, message);
  const type = true;
  if (date) {
    let menu = await lunch([date]);
    if (menu.error) {
      message.channel.send("Could not get lunch for specified date.")
      return;
    }

    message.channel.send(createEmbed.run(menu, "lunch"));

  } else {
    message.channel.send("Invalid Arguments" + require("./usage").run("lunch", config.prefix));
  }
  return;
}

// pre:
// post: link with requested date created
function createDate(query, message) {
  let td = new Date()
  if (query.length == 0 || query[0] == "today") { // no query or "today"
  } else {
    switch (query[0]) {
      case "tm":
      case "tomorrow":
        td.setDate(td.getDate() + 1);
        break;
      case "yesterday":
        td.setDate(td.getDate() - 1);
        break;
      case "week":
        break;
      default:
        try {
          query[2].toString();
          td = new Date(query[2], query[1] - 1, query[0]);
        } catch (e) {
          return;
        }
        break;
    }
  }
  return td;
}