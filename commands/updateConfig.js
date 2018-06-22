if (process.env.REDISTOGO_URL) {
  let rtg = require("url").parse(process.env.REDISTOGO_URL);
  let redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
}

module.exports.run = (id, key, value) => {
  redis.get((id).toString(), (err, config) => {
    redis.set((id).toString(), updateConfig(JSON.parse(config), (key).toString(), (value).toString()));
  });
}

function updateConfig(config, key, value) {
  config[key] = value;
  return JSON.stringify(config)
}