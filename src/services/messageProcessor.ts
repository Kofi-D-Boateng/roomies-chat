import { textProperties } from "../config/config";

export class MessageProcessor {
  private readonly swearJar: Map<string, string>;
  constructor() {
    this.swearJar = SwearJar.getJar();
  }

  public proccessMessage: (message: string) => string = (message) => {
    if (!this.validateText(message)) return "";
    const messageArray = message.split(" ");
    const validWords = [];
    for (let i = 0; i < messageArray.length; i++) {
      const word = messageArray[i];
      if (!this.swearJar.has(word)) validWords.push(word);
      else messageArray[i] = this.swearJar.get(word) as string;
    }
    return messageArray.join(" ");
  };

  private validateText: (text: string) => boolean = (text) => {
    let result: boolean = true;
    if (
      text.length < textProperties.minLength ||
      text.length > textProperties.maxLength
    ) {
      result = false;
    }

    return result;
  };
}
