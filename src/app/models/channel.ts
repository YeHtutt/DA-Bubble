import { UserProfile as User } from "./user-profile";

export class Channel {
    channelId: string;
    channelName: string;
    description: string;
    creationTime: any;
    creator: User;
    usersData: { email: string; id: string; name: string; photoUrl: string; } | undefined;

    constructor(obj?: any) {
        this.creationTime = obj ? obj.creationTime : '';
        this.channelId = obj ? obj.channelId : '';
        this.channelName = obj ? obj.channelName : '';
        this.description = obj ? obj.description : '';
        this.creator = obj ? obj.creator : '';
        this.usersData = obj ? obj.usersData : '';
    }

    public toJSON() {
        return {
            creationTime: this.creationTime,
            channelId: this.channelId,
            channelName: this.channelName,
            description: this.description,
            creator: this.creator,
            usersData: this.usersData
        }
    }
}