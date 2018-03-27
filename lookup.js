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
function getJSON(xml, type, message, callback, searchQuery) {
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

module.exports.dictionary = (json, type, message) => {
  //goes through json for dictionary entries
  let entries = [];
  for (let i of json.entry) { // main entry loop
    let entry = [];
    for (let j of i.def) { // goes through all definitions of entry
      let header = []; // makes header list with name and date
      header.push(i.ew.join("")); // name
      if (j.date) { // date
        header.push(j.date.join(""));
      }
      entry.push(header);
      for (k of j.dt) { // finds the "dt" key
        if (typeof(k) == "object") { //object
          try {
            let temp = k["_"].substring(k["_"].indexOf(":") + 1);
            if (k.sx) {
              temp += k.sx; // adds anything extra
            }
            entry.push(temp);
          } catch (e) {
            if (typeof(k) == "object") { // logs the words if there is an error
              fs.appendFile("./errorWords.txt", Object.keys(k).map(function(j) {
                return k[j]
              }) + "\n");
            } else {
              fs.appendFile("./errorWords.txt", k);
            }
          }
        } else { //string
          entry.push(k.substring(k.indexOf(":") + 1)); // adds string
        }
      }
    }
    entries.push(entry); // adds one entry to master list
  }
  message.channel.send(utils.printMsg(entries, type, bot, null, json));
}
