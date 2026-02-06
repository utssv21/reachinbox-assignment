import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL as string);

redis.on("connect", () => {
  console.log("Connected to Redis ✅");
});

export default redis;
