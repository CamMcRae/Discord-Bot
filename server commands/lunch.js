// libs
const lunchMenu = require('../lunch commands/lunchMenu.js');

// link: https://menu2.danahospitality.ca/hsc/menu.asp?r=1&ShowDate=1/26/2018
module.exports.run = async (query) => {
  let time = Date.now();
  // console.log("start");
  const td = new Date(query);
  const date = `${td.getMonth()+1}/${td.getDate()}/${td.getFullYear()}`
  let menu = {}
  menu.date = query;
  // console.log("request");
  if (date) {
    menu.lunch = await lunchMenu.run(date);
    if (menu.lunch.fields.length <= 1) {
      menu.error = true;
    }
  } else {
    menu.error = true;
  }
  // console.log("RETURN: ");
  // console.log(Date.now() - time);
  return menu;
}