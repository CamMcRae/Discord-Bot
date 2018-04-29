// libs
const cheerio = require('cheerio');
const requestpromise = require("request-promise");

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
  return await requestpromise(options);
}

// pre: json input
// post: filter all entries and important information
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
        let temp = i.def.dt["#text"].substring(i.def.dt["#text"].indexOf(":") + 1);
        if (temp) {
          entry.push(temp);
        } else {
          entry = [];
        }
      } catch (e) {
        entry = [];
      }
    } else {
      entry.push(i.def.dt.substring(i.def.dt.indexOf(":") + 1));
    }
    if (entry[1]) {
      entries.push(entry); // adds one entry to master list
    }
  }
  return entries;
}

module.exports.format = (json) => {
  let definitions = {};
  let count = 0;
  for (let i of json.entry) {
    let entry = [];
    count++;

    // name
    definitions[count] = {
      name: (typeof(i.ew) == "object" ? i.ew.join("") : i.ew),
      definition: []
    }

    // date
    definitions[count].name += " [" + (typeof(i.def.date) == "object" ? i.def.date.join("") : i.def.date.toString()) + "]";

    if (Array.isArray(i.def.dt)) {
      for (k of i.def.dt) {
        try {
          if (typeof(k) == "object") {
            try {
              definitions[count].definition.push(k["#text"].substring(k["#text"].indexOf(":") + 1))
              if (k.sx) {
                if (typeof(k.sx) == "object" && typeof(k.sx) != "string") {
                  if (Array.isArray(k.sx)) {
                    definitions[count].definition.push(k.sx.join(" "))
                  } else if (k.sx["#text"]) {
                    definitions[count].definition.push(k.sx["#text"])
                  }
                } else {
                  definitions[count].definition.push(k.sx)
                }
              }
            } catch (err) {
              console.log(err);
            }
          } else {
            definitions[count].definition.push(k.substring(k.indexOf(":") + 1))
          }
        } catch (err) {
          console.log(err);
        }
      }
    } else if (typeof(i.def.dt) == "object") {
      try {
        let temp = i.def.dt["#text"].substring(i.def.dt["#text"].indexOf(":") + 1);
        if (temp) {
          definitions[count].definition.push(temp);
        }
      } catch (err) {}
    } else {
      definitions[count].definition.push(i.def.dt.substring(i.def.dt.indexOf(":") + 1));
    }
    for (let i of Object.keys(definitions)) {
      definitions[i].definition = definitions[i].definition.filter(Boolean);
      if (definitions[i].definition.length == 0) definitions[i].definition = ["**No Entry**"]
    }
  }
  return definitions
}