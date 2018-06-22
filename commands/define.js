// libs
const cheerio = require('cheerio');
const requestpromise = require("request-promise");
const fastparse = require('fast-xml-parser');

// files
const createEmbed = require("./createEmbed.js");
const apiRequest = require("./apiRequest.js");

module.exports.run = (client, message, query) => {
  const dictSearchQuery = query.join(" ");
  if (!dictSearchQuery) return;
  let url = `https://www.dictionaryapi.com/api/v1/references/collegiate/xml/${dictSearchQuery.split(" ").join("%20")}?key=${dictKey}`;
  dictionary(url, message, dictSearchQuery);
}

async function dictionary(url, message, searchQuery) {

  // requests lookup
  const response = await apiRequest.run(url);

  // parses xml into json
  const json = fastparse.parse(response).entry_list;

  let entries = {
    key: searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)
  }

  if (json.entry) entries.definitions = format(json);
  if (json.suggestion) entries.suggestion = (Array.isArray(json.suggestion) ? json.suggestion.join("\n - ") : json.suggestion);

  // creates embed
  message.channel.send(createEmbed.run(entries, "dict"));
}

function format(json) {
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