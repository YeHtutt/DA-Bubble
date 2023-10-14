import { UserProfile as User } from "./user-profile";

export class Message {
    text: string;
    time: any;
    user: User;
    messageId: string;
    textEdited: false;

    constructor(obj?: any) {
        this.text = obj ? obj.text : '';
        this.time = obj ? obj.time : '';
        this.user = obj ? obj.user : '';
        this.messageId = obj ? obj.messageId : '';
        this.textEdited = obj ? obj.textEdited : false;
    }

    public toJSON() {
        return {
            text: this.text,
            time: this.time,
            user: this.user,
            messageId: this.messageId,
            textEdited: this.textEdited
        };
    }

    public static fromJSON(json: any): Message {
        return new Message({
            text: json.text,
            time: json.time,
            user: json.user,
            messageId: json.messageId,
            textEdited: json.textEdited
        });
    }
}




