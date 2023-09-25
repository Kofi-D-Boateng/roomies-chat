import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Room } from "../classes/roomClass";
import { User } from "../classes/user";
import { JoinRoomDatagram } from "../types/JoinRoom";

export const JoinRoomController: (
  data: JoinRoomDatagram,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  store: Map<string, Room<string, User>>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => void = (data, io, store, socket) => {
  const Room = store.get(data.roomId);
  if (!Room) {
    io.to(socket.id).emit("room-status", { msg: "error" });
    return;
  }
  const DataStore = Room.getStore();
  const USER: User = new User(data.userId, data.username);
  DataStore.set(data.userId, USER);
  const roomArray: Array<User> = new Array();
  DataStore.forEach((user) => roomArray.push(user));
  socket.join(Room.getKey());
  // socket.emit(
  //   "all-users",
  //   roomArray.filter((user) => user.getId() != USER.getId())
  // );
  store.set(data.roomId, Room);
};
