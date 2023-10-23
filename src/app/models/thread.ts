import { UserProfile as User } from "./user-profile";
export class Thread {
    text: string;
    time: any;
    user: User;
    threadId: string;
    textEdited: false;
    reactions: [];

    constructor(obj?: any) {
        this.text = obj ? obj.text : '';
        this.time = obj ? obj.time : '';
        this.user = obj ? obj.user : '';
        this.threadId = obj ? obj.threadId : '';
        this.textEdited = obj ? obj.textEdited : false;
        this.reactions = obj ? obj.reactions : [];
    }

    public toJSON() {
        return {
            text: this.text,
            time: this.time,
            user: this.user,
            threadId: this.threadId,
            textEdited: this.textEdited,
            reactions: this.reactions
        };
    }

    public static fromJSON(json: any): Thread {
        return new Thread({
            text: json.text,
            time: json.time,
            user: json.user,
            threadId: json.threadId,
            textEdited: json.textEdited,
            reactions: json.reactions
        });
    }
}

