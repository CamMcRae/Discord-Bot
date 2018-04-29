// libs
const cheerio = require('cheerio');
const requestpromise = require("request-promise");
const fastparse = require('fast-xml-parser');

// files
const createEmbed = require("./createEmbed.js");
const apiRequest = require("./apiRequest.js");

module.exports.run = (client, message, query) = {
  let dictSearchQuery = query.join(" ");
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
    key: searchQuery.charAt(0).toUpperCase() + word.slice(1)
  }

  if (json.entry) entries.definitions = format(json);
  if (json.suggestion) entries.suggestion = " - " + json.suggestion.join("\n - ");

  // creates embed
  message.channel.send(createEmbed.run(entries, "dict", searchQuery, json));
}

// pre: json input
// post: filter all entries and important information
function format(json) {
  //goes through json for dictionary entries
  let entries = {};
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