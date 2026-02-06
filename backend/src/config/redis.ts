import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined ❌");
}

export const redisConnection = new Redis(process.env.REDIS_URL);

redisConnection.on("connect", () => {
  console.log("Connected to Redis ✅");
});

redisConnection.on("error", (err) => {
  console.error("Redis error ❌", err);
});
