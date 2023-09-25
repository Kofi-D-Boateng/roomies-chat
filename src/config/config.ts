"use strict";
import { randomBytes } from "crypto";

export const CONFIG = {
  PORT: process.env.CHAT_PORT || 7210,
  JWT_SECRET: process.env.JWT_SECRET || randomBytes(12).toString("hex"),
  EXPIRESIN: process.env.EXPIRES_IN || "60000",
  ORIGINS: process.env.CORS_ORIGINS || "*",
  LOGGER_TYPE: process.env.LOGGER || "dev",
  MAX_ROOM_CAPACITY: process.env.MAX_CAPACITY || 100,
  REDIS_HOST: process.env.REDIS_CACHE_IP,
  REDIS_PORT: process.env.REDIS_CACHE_PORT,
  MONGO: {
    CONN_STR: process.env.MONGO_CONNECTION_STRING,
    DB: process.env.MONGO_DB_NAME,
    COLLECTION_NAME: process.env.MONGO_MESSAGE_COLLECTION,
  },
  TOKEN_CONFIG: {
    LENGTH_OF_TOKEN: +process.env.TOKEN_LENGTH! || 8,
    TOKEN_STRING_FORMAT: process.env.TOKEN_STRING_FORMAT || "hex",
  },
  ROOM_CONFIG: {
    ROOM_ID_FORMAT: process.env.ROOM_ID_FORMAT || "hex",
    LENGTH_OF_ID: +process.env.TOKEN_LENGTH! || 12,
  },
  AWS: {
    SECRET_KEY: process.env.AWS_SECRET_KEY,
    ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    REGION: process.env.AWS_REGION,
    S3: {
      BUCKET_NAME: process.env.BUCKET_NAME,
      EXPIRATION: process.env.PRESIGNED_EXPIRATION
        ? parseInt(process.env.PRESIGNED_EXPIRATION)
        : 0,
    },
  },
  RECURSIVE_ATTEMPTS: {
    CREATE_ROOM: 10,
  },
  PATH: "/chat-socket",
};

export const API_VERSION = "api/v1";

export const ROUTES = {
  USER_SETTINGS: "/configure-room",
  USER_LOGIN: "/authenticate-user",
  FIND_ROOM: "/find-room",
  CREATE_ROOM: "/create-room",
};

export const photosResize = {
  width: 200,
  height: 200,
  format: "jpeg",
};
