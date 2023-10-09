import "dotenv/config";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Room } from "../classes/roomClass";
import { User } from "../classes/user";
import { RoomMessage, MessageDatagram } from "../types/Message";
import Kafka from "node-rdkafka";
import { AvailableFormatInfo } from "sharp";
import { CONFIG, photosResize } from "../config/config";
import { SharpImageScaler } from "../services/sharpImageScaler";
import { MessageProcessor } from "../services/messageProcessor";
import { Store } from "../services/datasore";
import { Topic } from "../enums/topic";
import { ApiKeyValidator } from "../services/apiKeyValidator";

export const messageController: (
  data: MessageDatagram,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  store: Store<Room<string, User>>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  scaler: SharpImageScaler,
  processor: MessageProcessor
) => void = async (data, io, store, socket, scaler, processor) => {
  const result = await ApiKeyValidator.validate(data.apiKey);

  if (!result) {
    socket.emit("unauthorized", true);
    return;
  }

  const photoType = "jpeg";
  const Room = await store.search(data.roomId);
  if (!Room) {
    socket.emit("room-status", { msg: "error" });
    return;
  }

  if (!Room.getStore().has(data.roomId)) return;

  const stream = Kafka.Producer.createWriteStream(
    { "metadata.broker.list": `${CONFIG.KAFKA_HOST || "localhost"}:9092` },
    {},
    { topic: Topic.SAVE_MESSAGE }
  );

  const validatedText = processor.proccessMessage(data.user.message);
  const validPhotoArray = await scaler.scale(
    data.user.photos,
    photosResize.width,
    photosResize.height,
    photoType as unknown as AvailableFormatInfo
  );

  if (validatedText.trim().length !== 0 || validPhotoArray.length !== 0) {
    const processedMessage: RoomMessage = {
      senderId: data.user.id,
      sender: data.user.username,
      text: processor.proccessMessage(data.user.message),
      photos: await scaler.scale(
        data.user.photos,
        photosResize.width,
        photosResize.height,
        photoType as unknown as AvailableFormatInfo
      ),
      createdAt: Date.now(),
      mimeType: `image/${photoType}`,
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
    store.update(data.roomId, Room);
    io.to(Room.getKey()).emit("chat", processedMessage);
  }
};
