import Redis from 'ioredis';

const redis = new Redis({
  port: +process.env.REDIS_PORT!,
  host: process.env.REDIS_HOST!,
  username: process.env.REDIS_USERNAME!,
  password: process.env.REDIS_PASSWORD!,
});

redis.on('error', (error) => {
  console.error('Redis error:', error);
  process.exit(1);
});

export default redis;
