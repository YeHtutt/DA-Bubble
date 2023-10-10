import { UserProfile as User } from "./user-profile";

export class Message {
    text: string;
    time: Date;
    user: User;

    constructor(obj?: any) {
        this.text = obj ? obj.text : '';
        this.time = obj ? obj.time : new Date();
        this.user = obj ? obj.sender : null;
    }

    public toJSON() {
        return {
            text: this.text,
            time: this.time,
            user: this.user ? this.user.toJSON() : null
        };
    }

    public static fromJSON(json: any): Message {
        return new Message({
            text: json.text,
            time: new Date(json.time),
            user: json.user ? User.fromJSON(json.user) : null
        });
    }
}
