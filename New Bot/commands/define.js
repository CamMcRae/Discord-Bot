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