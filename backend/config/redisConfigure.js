const redis = require("redis");

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (error) => {
    console.log("Redis Error:", error);
});

async function connectRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log("Redis connected successfully");
        }
    } catch (error) {
        console.warn("⚠️ Warning: Could not connect to Redis immediately. Retrying later...");
    }
}

module.exports = {
    redisClient,
    connectRedis
};