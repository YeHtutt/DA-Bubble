export class DirectChat {

    chatId: string;
    creationTime: any;
    user1: string = '';
    user2: string = '';
    splittedId: string = '';

    constructor(obj?: any) {
        this.chatId = obj ? obj.chatId : '';
        this.creationTime = obj ? obj.creationTime : '';
        this.user1 = obj ? obj.user1 : '';
        this.user2 = obj ? obj.user2 : '';
        this.splittedId = obj ? obj.splittedId : '';
    }

    public toJSON() {
        return {
            chatId: this.chatId,
            creationTime: this.creationTime,
            user1: this.user1,
            user2: this.user2,
            splittedId: this.splittedId,

        };
    }

    public static fromJSON(json: any): DirectChat {
        return new DirectChat({
            chatId: json.chatId,
            creationTime: json.creationTime,
            user1: json.user1,
            user2: json.user2,
            splittedId: json.splittedId,
        });
    }
}