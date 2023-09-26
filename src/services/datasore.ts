import * as redis from "redis";
import { parse, stringify } from "flatted";
import { CONFIG } from "../config/config";

const redisVars = CONFIG.ENV == "prod" ? CONFIG.PROD_REDIS : CONFIG.DEV_REDIS;

export interface Store<V> {
  search(key: string): Promise<V | null>;
  insert(key: string, value: V): void;
  update(key: string, value: V): void;
  remove(key: string): void;
}

export class DataStore<V> implements Store<V> {
  private static readonly store: redis.RedisClientType = redis.createClient({
    url: `redis://${redisVars.REDIS_HOST}:${redisVars.REDIS_PORT}`,
  });
  private static readonly duration: number = redisVars.DURATION
    ? +redisVars.DURATION
    : 30;
  constructor() {
    if (!DataStore.store.isReady) DataStore.store.connect();
  }

  async search(key: string): Promise<V | null> {
    try {
      const r = await DataStore.store.get(key);
      if (!r) return null;
      const parsedObjected: V = await parse(r);
      return parsedObjected;
    } catch (error) {
      return null;
    }
  }
  insert(key: string, value: V): void {
    try {
      DataStore.store.setEx(key, 60 * DataStore.duration, stringify(value));
    } catch (error) {
      console.log(error);
    }
  }
  update(key: string, value: V): void {
    try {
      DataStore.store.setEx(key, 60 * DataStore.duration, stringify(value));
    } catch (error) {
      console.log(error);
    }
  }
  remove(key: string): void {
    try {
      DataStore.store.del(key);
    } catch (error) {
      console.log(error);
    }
  }
}
