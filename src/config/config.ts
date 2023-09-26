"use strict";
import { randomBytes } from "crypto";

export const CONFIG = {
  ENV: process.env.env,
  PORT: process.env.CHAT_PORT || 7210,
  JWT_SECRET: process.env.JWT_SECRET || randomBytes(12).toString("hex"),
  EXPIRESIN: process.env.EXPIRES_IN || "60000",
  ORIGINS: process.env.CORS_ORIGINS || "*",
  LOGGER_TYPE: process.env.LOGGER || "dev",
  MAX_ROOM_CAPACITY: process.env.MAX_CAPACITY || 100,
  PROD_REDIS: {
    REDIS_HOST: process.env.PROD_REDIS_CACHE_IP,
    REDIS_PORT: process.env.PROD_REDIS_CACHE_PORT,
    DURATION: process.env.DURATION,
  },
  DEV_REDIS: {
    REDIS_HOST: process.env.DEV_REDIS_CACHE_IP,
    REDIS_PORT: process.env.DEV_REDIS_CACHE_PORT,
    DURATION: process.env.DURATION,
  },
  PROD_MONGO: {
    CONN_STR: process.env.PROD_MONGO_CONNECTION_STRING,
    DB: process.env.PROD_MONGO_DB_NAME,
    COLLECTION_NAME: process.env.PROD_MONGO_MESSAGE_COLLECTION,
  },
  DEV_MONGO: {
    CONN_STR: process.env.DEV_MONGO_CONNECTION_STRING,
    DB: process.env.DEV_MONGO_DB_NAME,
    COLLECTION_NAME: process.env.DEV_MONGO_MESSAGE_COLLECTION,
  },
  TOKEN_CONFIG: {
    LENGTH_OF_TOKEN: +process.env.TOKEN_LENGTH! || 8,
    TOKEN_STRING_FORMAT: process.env.TOKEN_STRING_FORMAT || "hex",
  },
  ROOM_CONFIG: {
    ROOM_ID_FORMAT: process.env.ROOM_ID_FORMAT || "hex",
    LENGTH_OF_ID: +process.env.TOKEN_LENGTH! || 12,
  },
  PROD_AWS: {
    SECRET_KEY: process.env.PROD_AWS_SECRET_KEY,
    ACCESS_KEY: process.env.PROD_AWS_ACCESS_KEY,
    REGION: process.env.PROD_AWS_REGION,
    S3: {
      BUCKET_NAME: process.env.PROD_BUCKET_NAME,
      EXPIRATION: process.env.PROD_PRESIGNED_EXPIRATION
        ? parseInt(process.env.PROD_PRESIGNED_EXPIRATION)
        : 0,
    },
  },
  DEV_AWS: {
    SECRET_KEY: process.env.DEV_AWS_SECRET_KEY,
    ACCESS_KEY: process.env.DEV_AWS_ACCESS_KEY,
    REGION: process.env.DEV_AWS_REGION,
    S3: {
      BUCKET_NAME: process.env.DEV_BUCKET_NAME,
      EXPIRATION: process.env.DEV_PRESIGNED_EXPIRATION
        ? parseInt(process.env.DEV_PRESIGNED_EXPIRATION)
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
