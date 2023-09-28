import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Room } from "../classes/roomClass";
import { User } from "../classes/user";
import { CreateRoomDatagram } from "../types/createRoom";
import { LinkedList } from "../utils/dataStructures/linkedList";
import { DatabaseSingleton } from "../utils/singletons/databaseSingleton";
import { RoomMessage } from "../types/Message";
import { AwsStorage } from "../services/storage";
import { Store } from "../services/datasore";
import crypto from "crypto";
import { ObjectId } from "mongodb";

export const createRoomController: (
  data: CreateRoomDatagram,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  store: Store<Room<string, User>>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  awsStore: AwsStorage
) => void = async (data, io, store, socket, awsStore) => {
  const rooms: Room<string, User>[] = [];

  for (const requestReference of data.requestReferences) {
    let room = await store.search(requestReference);
    const queriedRoom: { roomId: ObjectId; messages: RoomMessage[] } | null =
      await queryDB(requestReference);
    if (!room) {
      console.warn("Room was not found for reference:", requestReference);
      console.log("Creating room...");

      room = new Room<string, User>(
        queriedRoom?.roomId.toString() as string,
        "",
        2,
        new Map(),
        new LinkedList()
      );
    }

    if (room.getMessages().size() == 0) {
      queriedRoom?.messages.forEach((message) => {
        message.photoKeys.forEach(
          (key) => (key = awsStore.generateSignedUrl(key))
        );
      });
      for (const message of queriedRoom?.messages as RoomMessage[])
        room.insertMessage(message);
    }

    if (!room.getStore().has(data.userId)) {
      room.getStore().set(data.userId, new User(data.userId, data.username));
    }

    store.update(queriedRoom?.roomId.toString() as string, room);
    socket.join(queriedRoom?.roomId.toString() as string);
    rooms.push(room);
  }
  socket.emit("rooms", rooms);
};

const queryDB: (
  id: string
) => Promise<{ roomId: ObjectId; messages: RoomMessage[] } | null> = async (
  id
) => {
  try {
    const mongoClient = await DatabaseSingleton.getClient();
    const db = mongoClient.db(DatabaseSingleton.mongoObject.DB);
    const collection = db.collection(
      DatabaseSingleton.mongoObject.COLLECTION_NAME as string
    );
    const query = { request_reference: id };
    const foundItems = await collection.findOne(query);
    if (!foundItems) {
      throw new Error(`No items found for for id: ${id}`);
    }

    return {
      roomId: foundItems._id,
      messages: foundItems.messages,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};
