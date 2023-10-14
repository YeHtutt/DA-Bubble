export class messageTree {
    messageId: string;
    content: string;
    timestamp: Date;
    beganToChat: boolean = false;
    usersData: { email: string; id: string; name: string; photoUrl: string; } | undefined;
    sharedId: string;

    constructor(obj?: any) {
        this.messageId = obj ? obj.messageId : '';
        this.content = obj ? obj.content : '';
        this.timestamp = obj ? obj.timestamp : '';
        this.beganToChat = obj ? obj.beganToChat : false;
        this.sharedId = obj ? obj.sharedId : '';
    }


    public toJSON() {
        return {
            messageId: this.messageId,
            content: this.content,
            timestamp: this.timestamp,
            beganToChat: this.beganToChat,
            sharedId: this.sharedId
        }
    }


    public static fromJSON(json: any): messageTree {
        return new messageTree({
            messageId: json.messageId,
            content: json.content,
            timestamp: json.timestamp,
            beganToChat: json.beganToChat,
            sharedId: json.sharedId
        });
    }
}