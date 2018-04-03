// libs
const cheerio = require('cheerio');
const rp = require("request-promise");

// files
const utils = require("./utils.js");

// pre: url of page given
// post: returns xml of page
module.exports.apiRequest = async (url) => {
  const options = {
    uri: url,
    transform: (body) => {
      return cheerio.load(body).html();
    }
  };
  return await rp(options);
}

module.exports.dictionary = (json) => {
  //goes through json for dictionary entries
  let entries = [];
  for (let i of json.entry) { // main entry loop
    let entry = [];
    let header = [];
    if (typeof(i.ew) == "object") {
      header.push(i.ew.join(""));
    } else {
      header.push(i.ew);
    }
    if (i.def.date) { // date
      if (typeof(i.def.date) == "object") {
        header.push(i.def.date.join(""));
      } else {
        header.push(i.def.date.toString());
      }
    }
    entry.push(header);
    if (Array.isArray(i.def.dt)) {
      for (k of i.def.dt) {
        try {
          if (typeof(k) == "object") {
            try {
              let temp = k["#text"].substring(k["#text"].indexOf(":") + 1);
              if (k.sx) {
                temp += k.sx;
              }
              entry.push(temp);
            } catch (e) {}
          } else {
            entry.push(k.substring(k.indexOf(":") + 1));
          }
        } catch (e) {
          console.log(e);
        }
      }
    } else if (typeof(i.def.dt) == "object") {
      try {
        entry.push(k["#text"]);
      } catch (e) {}
    } else {
      entry.push(i.def.dt.substring(i.def.dt.indexOf(":") + 1));
    }
    entries.push(entry); // adds one entry to master list
  }
  return entries;
}