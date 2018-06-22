// pre: url of page given
// post: returns xml of page
module.exports.run = async (url) => {
  const options = {
    uri: url,
    transform: (body) => {
      return cheerio.load(body).html();
    }
  };
  return await requestpromise(options);
}