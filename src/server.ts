import cors, { CorsOptions } from "cors";
import express, { Express } from "express";
import { createServer, Server } from "http";
import logger from "morgan";
import { CONFIG } from "./config/config";
import { Server as Srv, Socket } from "socket.io";
import {
  _createRoom,
  _deleteRoomFromMemory,
  _searchForRoom,
  _updateRoom,
} from "./utils/redis/query";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { MessageDatagram } from "./types/Message";
import { DisconnectDatagram } from "./types/Disconnect";
import { StoreCacheSingleton } from "./utils/singletons/storeSingleton";
import { messageController } from "./socketControllers/messageController";
import { leaveController } from "./socketControllers/leaveController";
import { CreateRoomDatagram } from "./types/createRoom";
import { createRoomController } from "./socketControllers/createRoomController";
import { AwsStorage } from "./services/storage";
import { ImageScaler, SharpImageScaler } from "./services/sharpImageScaler";
import { MessageProcessor } from "./services/messageProcessor";

const app: Express = express();
const store = StoreCacheSingleton.getStore();
const scaler: ImageScaler = new SharpImageScaler();
const processor: MessageProcessor = new MessageProcessor();
const awsStore: AwsStorage = new AwsStorage(
  CONFIG.AWS.ACCESS_KEY || "",
  CONFIG.AWS.SECRET_KEY || "",
  CONFIG.AWS.REGION || "",
  CONFIG.AWS.S3.BUCKET_NAME || "",
  CONFIG.AWS.S3.EXPIRATION
);

const whitelist: CorsOptions = {
  origin: CONFIG.ORIGINS,
  credentials: true,
  optionsSuccessStatus: 204,
  methods: ["GET", "POST"],
};
app.use(logger(CONFIG.LOGGER_TYPE));
app.use(cors(whitelist));
app.use(express.json());

const server: Server = createServer(app);
const io = new Srv(server, {
  cors: whitelist,
  path: CONFIG.PATH,
  transports: ["websocket", "polling"],
});

// MAIN WORK
io.on(
  "connection",
  (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {
    io.to(socket.id).emit("connected", true);

    socket.on("create-room", async (data: CreateRoomDatagram) =>
      createRoomController(data, io, store, socket, awsStore)
    );

    socket.on("message", async (data: MessageDatagram) =>
      messageController(data, io, store, socket, scaler, processor)
    );

    socket.on("leave", async (data: DisconnectDatagram) =>
      leaveController(data, store, socket)
    );
  }
);

server.listen(CONFIG.PORT, () =>
  console.log(`Server listening on port:${CONFIG.PORT}`)
);
