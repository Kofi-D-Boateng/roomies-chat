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

export const createRoomController: (
  data: CreateRoomDatagram,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  store: Store<Room<string, User>>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  awsStore: AwsStorage
) => void = async (data, io, store, socket, awsStore) => {
  const rooms: Room<string, User>[] = [];

  for (const roomId of data.roomIds) {
    let room = await store.search(roomId);
    if (!room) {
      console.warn("Room was not found for id:", roomId);
      console.log("Creating room...");
      room = new Room<string, User>(roomId, "", 2, new Map(), new LinkedList());
    }

    if (room.getMessages().size() == 0) {
      const storedMessages: RoomMessage[] = await queryDBMessages(roomId);
      storedMessages.forEach((message) => {
        message.photoKeys.forEach(
          (key) => (key = awsStore.generateSignedUrl(key))
        );
      });
      for (const message of storedMessages) room.insertMessage(message);
    }

    if (!room.getStore().has(data.userId)) {
      room.getStore().set(data.userId, new User(data.userId, data.username));
    }

    store.update(roomId, room);
    socket.join(roomId);
    rooms.push(room);
  }
  socket.emit("rooms", rooms);
};

const queryDBMessages: (id: string) => Promise<RoomMessage[]> = async (id) => {
  try {
    const mongoClient = await DatabaseSingleton.getClient();
    const db = mongoClient.db(DatabaseSingleton.mongoObject.DB);
    const collection = db.collection(
      DatabaseSingleton.mongoObject.COLLECTION_NAME as string
    );
    const foundItems = await collection.findOne({ id: id });
    if (!foundItems) {
      throw new Error(`No items found for for id: ${id}`);
    }
    const messages: RoomMessage[] = foundItems.messages;
    return messages;
  } catch (error) {
    console.log(error);
    return [];
  }
};
