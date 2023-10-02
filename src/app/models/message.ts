import { UserProfile } from "./user-profile";

export class Message {    
    text: string;
    time: any;
    user: any[] = [];
    messageId: string;

    constructor(obj?: any) {
        this.text = obj ? obj.text : '';
        this.time = obj ? obj.time : '';
        this.user = obj && obj.user ? obj.replies.map((user: any) => new UserProfile({ obj: user })) : [];
        this.messageId = obj ? obj.messageId : '';
      
    }

    public toJSON() {
        return {
            text: this.text,
            time: this.time,
            user: this.user.map(user => user.toJSON()),
            messageId: this.messageId,           
        };
    }
}

