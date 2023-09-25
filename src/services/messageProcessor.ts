export class MessageProcessor {
  private readonly swearJar: Map<string, string>;
  constructor() {
    this.swearJar = SwearJar.getJar();
  }

  proccessMessage: (message: string) => string = (message) => {
    const messageArray = message.split(" ");
    const validWords = [];
    for (let i = 0; i < messageArray.length; i++) {
      const word = messageArray[i];
      if (!this.swearJar.has(word)) validWords.push(word);
      else messageArray[i] = this.swearJar.get(word) as string;
    }
    return messageArray.join(" ");
  };
}
