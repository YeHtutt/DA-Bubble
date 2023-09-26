export class Channel {
    channelId: string;
    channelName: string;
    description: string;
    creatorId: string;
    creationTime: any;
    createdBy: string;

    constructor(obj?: any) {
        this.channelId = obj ? obj.channelId : '';
        this.channelName = obj ? obj.channelName : '';
        this.creatorId = obj ? obj.creatorId : '';
        this.description = obj ? obj.description : '';
        this.creationTime = obj ? obj.creationTime : '';
        this.createdBy = obj ? obj.createdBy : '';
    }

    public toJSON() {
        return {
            channelId: this.channelId,
            channelName: this.channelName,
            creatorId: this.creatorId,
            description: this.description,
            creationTime: this.creationTime,
            createdBy: this.createdBy,
        }
    }
}

export class Message {
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
        // this.replies = obj && obj.replies ? obj.replies.map(reply => new Reply({ obj: reply })) : [];
    }

    public toJSON() {
        return {
            text: this.text,
            time: this.time,
            userId: this.userId,
            username: this.username,
            userEmail: this.userEmail,
            messageId: this.messageId,
            // replies: this.replies.map(reply => reply.toJSON())
        };
    }
}

export class Reply {
    text: string;
    time: any;
    userId: string;
    username: string;
    userEmail: string;

    constructor({ obj }: { obj?: any; } = {}) {
        this.text = obj ? obj.text : '';
        this.time = obj ? obj.time : '';
        this.userId = obj ? obj.userId : '';
        this.username = obj ? obj.username : '';
        this.userEmail = obj ? obj.userEmail : '';
    }

    public toJSON() {
        return {
            text: this.text,
            time: this.time,
            userId: this.userId,
            username: this.username,
            userEmail: this.userEmail
        };
    }
}
