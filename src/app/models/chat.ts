export class Chat {
  name: string;
  chatId: number;


  constructor(obj?: any) {
    this.name = obj ? obj.name : '';
    this.chatId = obj ? obj.id : '';
  }


  public toJSON() {
    return {
        name: this.name,
        id: this.chatId
    };
}
}
