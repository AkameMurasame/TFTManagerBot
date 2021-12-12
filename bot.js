const {ShardingManager } = require("discord.js");
const config = require('./auth.json');

const manager = new ShardingManager("./init.js", {
    totalShards: "auto",
    token: "OTE4ODc0MzU5NTc2MjgxMTQ4.YbNmbw.UevqiI2xgKtCdK6BAamF03g3BvA"
});

// Emitted when a shard is created
manager.on("shardCreate", (shard) => console.log(`Shard ${shard.id} launched`));

// Spawn your shards
manager.spawn();