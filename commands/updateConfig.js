module.exports.run = (id, key, value) = {
  redis.get((id).toString(), (err, config) => {
    redis.set((id).toString(), updateConfig(JSON.parse(config), (key).toString(), (value).toString()));
  });
}

function updateConfig(config, key, value) {
  config[key] = value;
  return JSON.stringify(config)
}