// libs
const https = require("https");
const xml2js = require("xml2js");

// files
const utils = require("./utils.js");

module.exports.apiRequest = (url, type, message, callback, searchQuery) => {
  https.get(url, res => { // calls api
    let data = '';
    res.on('data', chunk => { // when data is recieved
      data += chunk;
    });
    res.on("end", () => { // when call if finished
      let json = getJSON(data, type, message, callback, searchQuery);
    });
  });
}

// pre: input xml
// post: returns json from xml
module.exports.getJSON = (xml, type, message, callback, searchQuery) => {
  let parser = new xml2js.Parser();
  parser.parseString(xml, function(err, result) { // converts xml to json
    let json = result.entry_list;
    if (json.entry) { // if there are valid entries
      callback(json, type, message);
    } else { // if no valid entries
      message.channel.send(utils.printMsg([], type, bot, searchQuery, json));
    }
  });
}
