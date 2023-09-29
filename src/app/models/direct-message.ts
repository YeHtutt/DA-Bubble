export class DirectMessage {    
    text: string;
    time: any;
    userId: string;
    username: string;
    userEmail: string;
    messageId: string;
    // replies: Reply[];

    constructor(obj?: any) {
        this.text = obj ? obj.text : '';
        this.time = obj ? obj.time : '';
        this.userId = obj ? obj.userId : '';
        this.username = obj ? obj.username : '';
        this.userEmail = obj ? obj.userEmail : '';
        this.messageId = obj ? obj.messageId : '';
      
    }

    public toJSON() {
        return {
            text: this.text,
            time: this.time,
            userId: this.userId,
            username: this.username,
            userEmail: this.userEmail,
            messageId: this.messageId,           
        };
    }
}

