import { RoomMessage } from "../types/Message";
import { LinkedList } from "../utils/dataStructures/linkedList";
import { PriorityQueue } from "../utils/dataStructures/priorityQueue";

export class Room<K extends string | number | symbol, V> {
  private key: K;
  private name: string;
  private maxCapacity: number;
  private store: Map<K, V>;
  private messages: LinkedList<RoomMessage>;
  constructor(
    key: K,
    name: string,
    maxCapacity: number,
    store: Map<K, V>,
    list: LinkedList<RoomMessage>
  ) {
    this.key = key;
    this.name = name;
    this.maxCapacity = maxCapacity;
    this.store = store;
    this.messages = list;
  }

  getKey(): K {
    return this.key;
  }
  getName(): string {
    return this.name;
  }
  getMaxCapcity(): number {
    return this.maxCapacity;
  }
  getStore(): Map<K, V> {
    return this.store;
  }
  getMessages(): LinkedList<RoomMessage> {
    return this.messages;
  }

  insertMessage(message: RoomMessage): void {
    const minHeap: PriorityQueue<RoomMessage> = new PriorityQueue(
      (a: RoomMessage, b: RoomMessage) => a?.createdAt - b?.createdAt
    );
    const oldMessages = this.messages;
    for (const message of oldMessages) minHeap.offer(message);
    minHeap.offer(message);
    const newMessageList: LinkedList<RoomMessage> = new LinkedList();
    while (!minHeap.isEmpty()) {
      const m = minHeap.poll();
      if (m) newMessageList.add(m);
    }
    this.messages.copy(newMessageList);
  }
}
