// pre: takes in a entry list and various other arguments for printing
// post: embed object created for discord to send
// format: [[Title, Description],[[Field Title, Extra], info], [etc...]]
module.exports.run = (entries, type, searchQuery, json) => {
  // default object creation
  let obj = {
    embed: {
      thumbnail: {
        url: "https://cdn.discordapp.com/embed/avatars/0.png"
      },
      author: {
        name: bot.user.username,
        icon_url: bot.user.avatarURL
      },
      footer: {
        icon_url: "https://cdn.discordapp.com/embed/avatars/0.png"
      },
      timestamp: new Date(),
      fields: []
    }
  };
  switch (type) {
    case "dict": //dictionary entry
      obj.embed.title = "Definitions for:";
      obj.embed.description = "[" + entries.key.charAt(0).toUpperCase() + entries.key.slice(1) + "](http://www.dictionary.com/browse/" + word.split(" ").join("-") + "?s=t)";
      obj.embed.color = 3447003;
      obj.embed.footer.text = entries.key;

      if (entries.definitions) {
        Object.keys(entries.definitions).forEach(i => {
          let temp = entries.definitions[i].definition.join("\n - ");
          if (temp.length > 1024) temp = temp.substring(0, temp.substring(0, 1024).lastIndexOf("-") - 2);
          obj.embed.fields.push({
            name: entries.definitions[i].name,
            value: entries.definitions[i].definition = " - " + temp
          });
        });
      } else {
        // if there are no entries for the input
        obj.embed.fields.push({
          name = "No entries found for " + word,
          value = "\u200b"
        });
        // if a suggested word list is returned
        if (json.suggestion) {
          obj.embed.fields.push({
            name = "Did you mean:",
            value = "\u2060- " + json.suggestion.join("\n - ")
          });
        }
      }
      break;
    case "thes":
      let word2 = (searchQuery ? searchQuery : json.entry[0].ew.join(""));
      obj.embed.title = "Synonyms for:";
      let thesDesc = "[" + word.charAt(0).toUpperCase() + word.slice(1) + "](http://www.thesaurus.com/browse/" + word + "?s=ts)";
      obj.embed.description = thesDesc;
      obj.embed.color = 15105570;
      obj.embed.footer.text = word.charAt(0).toUpperCase() + word.slice(1);
      if (entries.length > 0) {
        for (let i = 0; i < entries.length; i++) {
          obj.embed.fields[i].name = "*" + entries[i].shift() + "*";
          obj.embed.value = entries.join("\n - ");
        }
      } else {
        obj.embed.fields[0].name = "No entries found for " + word;
        obj.embed.fields[0].value = "\u200b";
      }
      break;
    case "swears":
      obj.embed.title = "Swear Counter";
      let swearDesc = entries.shift() + "is in the lead."
      obj.embed.description = thesDesc;
      obj.embed.fields.push({});
      obj.embed.fields[0].name = "Counter";
      let temp = "";
      for (let i = 0; i < entries.length; i++) {
        temp += client.users.get(entries[i][0]); + ": " + entries[i][1] + "\n";
      }
      obj.embed.fields[0].value = temp;
      obj.embed.footer.text = "\u200b";
      obj.embed.color = 0xff00ff;
      break;
    case "commands":
      obj.embed.title = "Commands for " + bot.user.username;
      obj.embed.description = "<Usage>";
      obj.embed.color = 0xff0909;
      obj.embed.footer.text = "Commands";

      Object.keys(entries).forEach(i => {
        obj.embed.fields.push({
          name: entries[i].name,
          value: "$" + entries[i].usage.join("\n$")
        });
      });
      break;
    case "lunch":
      obj.embed.title = entries.title;
      obj.embed.description = entries.desc;
      obj.embed.fields = entries.fields;
      obj.embed.color = 0x1FFF00;
      obj.embed.footer.text = "Lunch Menu";

      // obj.embed.thumbnail = {
      //   url: "./assets/Food.png"
      // }

      break;
  }
  return obj;
}