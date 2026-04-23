const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected successfully'));

async function initRedis() {
    await redisClient.connect();
}

module.exports = { redisClient, initRedis };
