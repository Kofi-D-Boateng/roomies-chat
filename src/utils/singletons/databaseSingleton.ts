import { MongoClient } from "mongodb";
import { CONFIG } from "../../config/config";

const mongo = CONFIG.ENV == "prod" ? CONFIG.PROD_MONGO : CONFIG.DEV_MONGO;

export class DatabaseSingleton {
  private static instance: DatabaseSingleton;
  private static readonly client: MongoClient = new MongoClient(
    mongo.CONN_STR as string
  );
  public static readonly mongoObject = mongo;
  constructor() {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = this;
    }
    return DatabaseSingleton.instance;
  }

  public static getInstance(): DatabaseSingleton {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DatabaseSingleton();
    }
    return DatabaseSingleton.instance;
  }

  public static async getClient(): Promise<MongoClient> {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DatabaseSingleton();
    }
    await DatabaseSingleton.client.connect();
    console.log("Connected successfully to mongo database");
    return DatabaseSingleton.client;
  }
}
