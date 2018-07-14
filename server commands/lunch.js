// libs
const cheerio = require('cheerio');
const requestpromise = require("request-promise");
const fastparse = require('fast-xml-parser');
const jsonframe = require('jsonframe-cheerio');


// link: https://menu2.danahospitality.ca/hsc/menu.asp?r=1&ShowDate=1/26/2018
module.exports.run = async (query) => {
  const td = new Date(query);
  const date = `${td.getMonth()+1}/${td.getDate()}/${td.getFullYear()}`
  let menu = {}
  if (date) {
    menu.lunch = await lunchMenu(date);
    if (menu.lunch.field.length <= 1) {
      menu.error = true;
    }
  } else {
    menu.error = true;
  }
  return menu;
}

async function lunchMenu(date) {
  const data = await scrapePage(date);
  const menu = sort(data, date);
}

// pre: date input
// post: required data scraped from page
// date, t/f, t = day;
function scrapePage(date) {
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
function sort(data, date) {
  // Default Menu
  const menu = {
    title: "Lunch Menu for: " + date,
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