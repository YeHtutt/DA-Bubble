export class DirectChat {

    chatId: string;
    creationTime: any;
    user: any[] = [];

    constructor(obj?: any) {
        this.chatId = obj ? obj.chatId : '';
        this.creationTime = obj ? obj.creationTime : '';
        this.user = obj && obj.user ? obj.user : [];
      
    }

    public toJSON() {
        return {
            text: this.chatId,
            time: this.creationTime,
            user: this.user.map(user => user.toJSON()),        
        };
    }
}
