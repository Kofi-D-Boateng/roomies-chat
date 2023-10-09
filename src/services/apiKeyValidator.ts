import * as redis from "redis";
import { CONFIG } from "../config/config";

const redisParams = CONFIG.ENV == "prod" ? CONFIG.PROD_REDIS : CONFIG.DEV_REDIS;
const url = `redis://${redisParams.REDIS_HOST}:${redisParams.REDIS_PORT}`;

export class ApiKeyValidator {
  private static readonly cache: redis.RedisClientType = redis.createClient({
    url: url,
  });
  public static validate: (key: string) => Promise<boolean> = async (key) => {
    await this.cache.connect();
    const ref = await this.cache.get(key);
    return ref != null;
  };
}
