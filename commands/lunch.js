const createEmbed = require("./createEmbed.js");

// libs
const cheerio = require('cheerio');
const requestpromise = require("request-promise");
const fastparse = require('fast-xml-parser');
const jsonframe = require('jsonframe-cheerio');


// link: https://menu2.danahospitality.ca/hsc/menu.asp?r=1&ShowDate=1/26/2018
module.exports.run = (client, message, query) => {
  const date = createDate(query, message);
  const type = true;
  if (date) {
    lunchMenu(date, type, message);
  } else {
    message.channel.send("Invalid Arguments" + require("./usage").run("lunch", config.prefix));
  }
  return;
}

// date, t/f, t = day;
async function lunchMenu(date, type, message) {
  const data = await scrapePage(date);
  const menu = sort(data, date, type);

  if (menu.fields.length > 1) {
    message.channel.send(utils.createEmbed(menu, "lunch"));
  } else {
    message.channel.send("No Lunch for " + date);
  }
}

// pre:
// post: link with requested date created
createDate(query, message) {
  let td = new Date()
  let date;
  if (query.length == 0 || query[0] == "today") { // no query or "today"
    date = `${td.getMonth()+1}/${td.getDate()}/${td.getFullYear()}`
  } else {
    switch (query[0]) {
      case "tm":
      case "tomorrow":
        td.setDate(td.getDate() + 1);
        date = `${td.getMonth()+1}/${td.getDate()}/${td.getFullYear()}`
        break;
      case "yesterday":
        td.setDate(td.getDate() - 1);
        date = `${td.getMonth()+1}/${td.getDate()}/${td.getFullYear()}`
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
        date = `${td.getMonth()+1}/${td.getDate()}/${td.getFullYear()}`
        break;
    }
  }
  return date;
}

// pre: date input
// post: required data scraped from page
// date, t/f, t = day;
scrapePage(date) {
  const url = `https://menu2.danahospitality.ca/hsc/menu.asp?r=1&ShowDate=${date}`;
  const options = {
    uri: url,
    transform: (body) => {
      let $ = cheerio.load(body); // load html
      let frame = {
        "menu": {
          _s: "tr",
          _d: [{
            "type": ".MenuSection",
            "name": ".ItemName .ItemName",
            "desc": ".ItemDescription"
          }]
        }
      }
      jsonframe($); // parse and scrape html
      return $('tbody').scrape(frame);
    }
  }
  return requestpromise(options);
}


// pre: json with lunch menu information
// post: object with organized data
sort(data, date, type) {
  // Default Menu
  const menu = {
    title: "Lunch Menu for: " + date,
    desc: (type ? "Daily" : " Weekly"),
    fields: []
  }
  // Default field values
  let menuTemp = {};
  for (let i of data.menu) { // each item of list
    if (Object.keys(i) == "type") {
      menuTemp.name = i.type;
    } else {
      menuTemp.value = Object.values(i).join("\n_") + (Object.values(i).length == 1 ? "" : "_");
    }
    if (menuTemp.value && menuTemp.name) {
      menu.fields.push(menuTemp);
      menuTemp = {}
    } else if (menuTemp.value && !menuTemp.name) {
      menuTemp = {}
    }
  }
  return menu;
}