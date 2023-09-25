import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Room } from "../classes/roomClass";
import { User } from "../classes/user";
import { DisconnectDatagram } from "../types/Disconnect";

export const leaveController: (
  data: DisconnectDatagram,
  store: Map<string, Room<string, User>>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => void = (data, store, socket) => {
  const Room = store.get(data.roomId);
  if (!Room) {
    socket.emit("room-status", { msg: "error" });
    return;
  }

  if (data.user.id !== socket.id) {
    socket.emit("room-status", { msg: "error" });
    return;
  }
  Room.getStore().delete(socket.id);

  if (Room.getStore().size <= 0) {
    store.delete(data.roomId);
    return;
  }

  socket.broadcast.emit("users-left", {
    leaver: socket.id,
  });

  store.set(data.roomId, Room);
  socket.disconnect(true);
};
