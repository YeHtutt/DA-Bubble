import { UserProfile as User } from "./user-profile";

export class Message {
    origin: string = '';
    text: string;
    time: any;
    user: User;
    messageId: string;
    textEdited: false;
    type = '';
    reactions: [];
    fileUpload: [];

    constructor(obj?: any) {
        this.origin = obj ? obj.origin : '';
        this.text = obj ? obj.text : '';
        this.time = obj ? obj.time : '';
        this.user = obj ? obj.user : '';
        this.messageId = obj ? obj.messageId : '';
        this.textEdited = obj ? obj.textEdited : false;
        this.type = obj ? obj.type : '';
        this.reactions = obj ? obj.reactions : [];
        this.fileUpload = obj ? obj.fileUpload : [];
    }

    public toJSON() {
        return {
            origin: this.origin,
            text: this.text,
            time: this.time,
            user: this.user,
            messageId: this.messageId,
            textEdited: this.textEdited,
            type: this.type,
            reactions: this.reactions,
            fileUpload: this.fileUpload
        };
    }

    public static fromJSON(json: any): Message {
        if (!json) return new Message(); // return an empty instance or handle as you see fit
        return new Message({
            origin: json.origin,
            text: json.text,
            time: json.time,
            user: json.user,
            messageId: json.messageId,
            textEdited: json.textEdited,
            type: json.type,
            reactions: json.reactions,
            fileUpload: json.fileUpload
        });
    }
}




