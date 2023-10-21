import { UserProfile as User } from "./user-profile";
export class Thread {
    text: string;
    time: any;
    user: User;
    messageId: string;
    textEdited: false;
    reactions: [];

    constructor(obj?: any) {
        this.text = obj ? obj.text : '';
        this.time = obj ? obj.time : '';
        this.user = obj ? obj.user : '';
        this.messageId = obj ? obj.messageId : '';
        this.textEdited = obj ? obj.textEdited : false;
        this.reactions = obj ? obj.reactions : [];
    }

    public toJSON() {
        return {
            text: this.text,
            time: this.time,
            user: this.user,
            messageId: this.messageId,
            textEdited: this.textEdited,
            reactions: this.reactions
        };
    }

    public static fromJSON(json: any): Thread {
        return new Thread({
            text: json.text,
            time: json.time,
            user: json.user,
            messageId: json.messageId,
            textEdited: json.textEdited,
            reactions: json.reactions
        });
    }
}

