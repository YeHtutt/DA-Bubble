import { UserProfile as User } from "./user-profile";

export class DirectMessage {
    messageId: string;
    content: string;
    timestamp: Date;
    sender: User;
    receiver: string;

    constructor(obj?: any) {
        this.messageId = obj ? obj.messageId : '';
        this.content = obj ? obj.content : '';
        this.timestamp = obj ? obj.timestamp : new Date();
        this.sender = obj ? obj.sender : null;
        this.receiver = obj ? obj.receiver : '';
    }

    public toJSON() {
        return {
            messageId: this.messageId,
            content: this.content,
            timestamp: this.timestamp,
            sender: this.sender,
            receiver: this.receiver
        }
    }

    public static fromJSON(json: any): DirectMessage {
        return new DirectMessage({
            messageId: json.messageId,
            content: json.content,
            timestamp: json.timestamp,
            sender: json.sender,
            receiver: json.receiver
        });
    }
}
