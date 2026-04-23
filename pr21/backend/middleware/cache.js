const { redisClient } = require('../config/redis');

const USERS_CACHE_TTL = 60;
const PRODUCTS_CACHE_TTL = 600;

async function saveToCache(key, data, ttl) {
    try {
        await redisClient.set(key, JSON.stringify(data), { EX: ttl });
        console.log(`Saved to cache: ${key}`);
    } catch (err) {
        console.error('Cache save error:', err);
    }
}

async function invalidateUsersCache(userId = null) {
    try {
        await redisClient.del('users:all');
        if (userId) {
            await redisClient.del(`users:${userId}`);
        }
        console.log('Users cache invalidated');
    } catch (err) {
        console.error('Users cache invalidate error:', err);
    }
}

async function invalidateProductsCache(productId = null) {
    try {
        await redisClient.del('products:all');
        if (productId) {
            await redisClient.del(`products:${productId}`);
        }
        console.log('Products cache invalidated');
    } catch (err) {
        console.error('Products cache invalidate error:', err);
    }
}

function cacheMiddleware(keyBuilder, ttl) {
    return async (req, res, next) => {
        try {
            const key = keyBuilder(req);
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                console.log(`Cache HIT: ${key}`);
                return res.json({
                    source: 'cache',
                    data: JSON.parse(cachedData)
                });
            }
            console.log(`Cache MISS: ${key}`);
            req.cacheKey = key;
            req.cacheTTL = ttl;
            next();
        } catch (err) {
            console.error('Cache read error:', err);
            next();
        }
    };
}

module.exports = {
    USERS_CACHE_TTL,
    PRODUCTS_CACHE_TTL,
    saveToCache,
    invalidateUsersCache,
    invalidateProductsCache,
    cacheMiddleware
};