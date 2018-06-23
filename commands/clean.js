// pre:
// post: cleans the defined amount of messages, only bot interaction messages or a users messages
module.exports.run = async (client, message, query, config) => {
  // maybe get array of sent messages, filter by bot, shift 1 and get ones above?
  if (query.length == 0) { // Purges only bot messages
    const fetched = await message.channel.fetchMessages();
    const botMessages = await fetched.filter(msg => msg.member.id === bot.user.id || msg.content.slice(0, config.prefix.length) == config.prefix).array().slice(0, 100);
    message.channel.bulkDelete(botMessages).catch(error => {
      console.log(error.stack);
      message.channel.send("Error deleting messages!");
    });
    message.channel.send(":recycle: `" + botMessages.length + " ` messages were removed!").then(msg => {
      msg.delete(3000)
    });
  } else if (message.member.roles.find("name", config.adminRole)) { // if its admin
    const user = message.mentions.users.first();
    let amount = !!parseInt(query[0]) ? parseInt(query[0]) : parseInt(query[1]);
    if (!amount) {
      message.channel.send("Specify and amount of messages to delete");
      return;
    }
    if (user) { // if user is specified
      message.channel.fetchMessages().then((messages) => {
        messages = messages.filter(msg => msg.author.id === user.id).array().slice(0, amount);
        message.channel.bulkDelete(messages).catch(error => {
          console.log(error.stack);
          message.channel.send("Error deleting messages!");
        });
        message.channel.send(":recycle: `" + messages.length + " ` messages were removed!").then(msg => {
          msg.delete(3000)
        });
      }).catch(error => {
        console.log(error);
      });;
    } else { // if no user is specified
      message.channel.fetchMessages({
        limit: amount
      }).then((messages) => {
        message.channel.bulkDelete(messages).catch(error => {
          console.log(error.stack);
          message.channel.send("Error deleting messages!");
        });
        message.channel.send(":recycle: `" + amount + "` messages were removed!").then(msg => {
          msg.delete(3000)
        });
      }).catch(error => {
        console.log(error);
      });;
    }
  }
}