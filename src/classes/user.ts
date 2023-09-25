export class User {
  private id: string;
  private username: string;
  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }

  getId(): string {
    return this.id;
  }
  getUsername(): string {
    return this.username;
  }
}
