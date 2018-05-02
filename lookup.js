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
module.exports.format = (json) => {
  let definitions = {};
  let count = 0;
  if (!Array.isArray(json.entry)) {
    json.entry2 = json.entry
    json.entry = [];
    json.entry.push(json.entry2);
  }
  for (let i of json.entry) {
    let entry = [];
    count++;

    // name
    definitions[count] = {
      name: (typeof(i.ew) == "object" ? i.ew.join("") : i.ew),
      definition: []
    }

    // date
    if (i.def.date) definitions[count].name += " [" + (typeof(i.def.date) == "object" ? i.def.date.join("") : i.def.date.toString()) + "]";

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
  }
  for (let i of Object.keys(definitions)) {
    definitions[i].definition = definitions[i].definition.filter(Boolean);
    if (definitions[i].definition.length == 0) definitions[i].definition = ["**No Entry**"]
  }
  return definitions
}