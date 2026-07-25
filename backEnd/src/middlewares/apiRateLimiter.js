const redisClient = require("../config/redis");
const isRedisAvailable = () => {
    return redisClient && redisClient.isOpen && redisClient.isReady;
};

const createRateLimiter = (windowSeconds, maxRequests) => {
    const formatTime = (seconds) => {
        if (seconds < 60) {
            return `${seconds} second${seconds > 1 ? 's' : ''}`;
        }
        const minutes = Math.ceil(seconds / 60);
        if (minutes < 60) {
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        const hours = Math.ceil(minutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    };

    return async (req, res, next) => {
        if (!isRedisAvailable()) {
            return next();
        }

        try {
            const key = `rl:${req.ip}`;
            const currentTime = Date.now();
            const multi = redisClient.multi();
            multi.zremrangebyscore(key, 0, currentTime - (windowSeconds * 1000));
            multi.zcard(key);
            
            const results = await multi.exec();
            const currentCount = results[1] || 0;
            
            if (currentCount >= maxRequests) {
                const oldestTimestamp = await redisClient.zrange(key, 0, 0, 'WITHSCORES');
                const resetTime = oldestTimestamp.length > 0 
                    ? Math.ceil((parseInt(oldestTimestamp[1]) + (windowSeconds * 1000)) / 1000)
                    : Math.ceil((currentTime + (windowSeconds * 1000)) / 1000);
                const retryAfter = Math.ceil((resetTime * 1000 - currentTime) / 1000);
                
                return res.status(429).json({
                    success: false,
                    message: `Too many requests. Try again after ${formatTime(retryAfter)}`,
                    retryAfter: retryAfter
                });
            }
            await redisClient.zadd(key, currentTime, `${currentTime}:${Math.random()}`);
            await redisClient.expire(key, windowSeconds * 2);
            const remaining = Math.max(0, maxRequests - currentCount - 1);
            const resetTimestamp = Math.ceil((currentTime + (windowSeconds * 1000)) / 1000);
            
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', remaining);
            res.setHeader('X-RateLimit-Reset', resetTimestamp);
            
            next();

        } catch (error) {
            
            next();
        }
    };
};

module.exports = createRateLimiter;