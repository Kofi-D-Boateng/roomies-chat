export type MessageDatagram = {
  apiKey: string;
  roomId: string;
  user: {
    id: string;
    username: string;
    message: string;
    photos: Buffer[];
  };
};

type Message = {
  senderId?: string;
  sender: string;
  text: string;
  photos: Buffer[];
  mimeType: string;
  createdAt: number;
};

type StoredMessage = {
  id?: string;
  sender: string;
  text: string;
  photoKeys: string[];
  createdAt: number;
};

export type RoomMessage = Message & StoredMessage;
