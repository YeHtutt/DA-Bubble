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