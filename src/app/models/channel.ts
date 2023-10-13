import { UserProfile as User } from "./user-profile";

export class Channel {
    channelId: string;
    channelName: string;
    description: string | null;
    creationTime: any;
    creator: User;
    usersData: {} | undefined;

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

    public static fromJSON(json: any): Channel {
        return new Channel({
            channelId: json.channelId,
            channelName: json.channelName,
            creator: json.creator,
            description: json.description,
            creationTime: json.creationTime,
            usersData: json.usersData,
        });
    }
}