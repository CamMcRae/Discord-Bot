// libs
const cheerio = require('cheerio');
const requestpromise = require("request-promise");
const fastparse = require('fast-xml-parser');
const jsonframe = require('jsonframe-cheerio');

// pre:
// post: link with requested date created
module.exports.createDate = (query, message) => {
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
          td = new Date(query[2], query[1] - 1, query[0]);
        } catch (e) {
          message.channel.send("Invalid Arguments provided");
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
module.exports.scrape = (date) => {
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
  return request(options);
}


// REWORK TO MAKE JSON FOR EMBED
// pre: json with lunch menu information
// post: list with organized data
module.exports.sort = (data) => {
  let menu = [];
  let menuTemp = [];
  for (let i of data.menu) { // each item of list
    if (menuTemp.length > 1) {
      menuTemp = [];
    }
    if (Object.keys(i) == "type") {
      menuTemp.push(i.type) // header
    } else {
      for (let j of Object.keys(i)) {
        menuTemp.push(i[j]); // name and description
      }
    }
    if (menuTemp.length != 1) { // only pushes if there is more than just a name
      menu.push(menuTemp);
    }
  }
}