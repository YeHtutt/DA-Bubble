import { UserProfile as User } from "./user-profile";
export class Reply {
    text: string = '';
    time: any;
    user: User;
    replyId: string = '';
    textEdited: boolean = false;
    type: string = 'reply';
    reactions: any[] = [];

    constructor(obj?: any) {
        this.text = obj ? obj.text : '';
        this.time = obj ? obj.time : '';
        this.user = obj ? obj.user : '';
        this.replyId = obj ? obj.replyId : '';
        this.textEdited = obj ? obj.textEdited : false;
        this.type = obj ? obj.type : '';
        this.reactions = obj ? obj.reactions : [];
    }

    public toJSON() {
        return {
            text: this.text,
            time: this.time,
            user: this.user,
            replyId: this.replyId,
            textEdited: this.textEdited,
            type: this.type,
            reactions: this.reactions
        };
    }

    public static fromJSON(json: any): Reply {
        if (!json) return new Reply(); // return an empty instance or handle as you see fit
        return new Reply({
            text: json.text,
            time: json.time,
            user: json.user,
            replyId: json.replyId,
            textEdited: json.textEdited,
            type: json.type,
            reactions: json.reactions
        });
    }
}

