const {ShardingManager } = require("discord.js");
const config = require('./auth.json');

const manager = new ShardingManager("./bot.js", {
    totalShards: "auto",
    token: config.BOT_TOKEN
});

// Emitted when a shard is created
manager.on("shardCreate", (shard) => console.log(`Shard ${shard.id} launched`));

// Spawn your shards
manager.spawn();