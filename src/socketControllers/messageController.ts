import "dotenv/config";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Room } from "../classes/roomClass";
import { User } from "../classes/user";
import { RoomMessage, MessageDatagram } from "../types/Message";
import Kafka from "node-rdkafka";
import { AvailableFormatInfo } from "sharp";
import { photosResize } from "../config/config";
import { SharpImageScaler } from "../services/sharpImageScaler";
import { MessageProcessor } from "../services/messageProcessor";

export const messageController: (
  data: MessageDatagram,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  store: Map<string, Room<string, User>>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  scaler: SharpImageScaler,
  processor: MessageProcessor
) => void = async (data, io, store, socket, scaler, processor) => {
  const Room = store.get(data.roomId);
  if (!Room) {
    socket.emit("room-status", { msg: "error" });
    return;
  }

  if (!Room.getStore().has(data.roomId)) return;

  const stream = Kafka.Producer.createWriteStream(
    { "metadata.broker.list": "" },
    {},
    { topic: "message-to-db" }
  );

  const processedMessage: RoomMessage = {
    senderId: data.user.id,
    sender: data.user.username,
    text: processor.proccessMessage(data.user.message),
    photos: await scaler.scale(
      data.user.photos,
      photosResize.width,
      photosResize.height,
      "jpeg" as unknown as AvailableFormatInfo
    ),
    createdAt: Date.now(),
    photoKeys: [],
  };
  Room.insertMessage(processedMessage);
  stream.write(
    Buffer.from(
      JSON.stringify({
        roomId: data.roomId,
        message: processedMessage,
      })
    )
  );
  store.set(data.roomId, Room);
  io.to(Room.getKey()).emit("chat", processedMessage);
};

// CREATE A SERVICE THAT WILL WORK ON WRITING TO THE DB AND AWS VIA DATA PROCESSING
