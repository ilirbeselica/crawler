import IORedis from 'ioredis';


const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const connection = new IORedis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
});

connection.on('connect', () => {
  console.log(`Connected to Redis at ${REDIS_HOST}:${REDIS_PORT}`);
});

connection.on('error', error => {
  console.error('Redis connection error:', error);
});

export default connection;