const redis = require('redis');

const redisClient = redis.createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT) || 11665,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                return new Error('Redis max reconnection attempts reached');
            }
            return Math.min(Math.pow(2, retries) * 100, 3000);
        },
        connectTimeout: 10000,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined
    }
});

let reconnectLogged = false;

redisClient.on('error', () => {
    if (!reconnectLogged) {
        reconnectLogged = true;
    }
});

redisClient.on('connect', () => {
    reconnectLogged = false;
});

redisClient.on('reconnecting', () => {
    if (!reconnectLogged) {
        reconnectLogged = true;
    }
});

redisClient.isConnected = () => {
    return redisClient.isOpen && redisClient.isReady;
};

module.exports = redisClient;