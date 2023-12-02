export class UserProfile {
    name: string = '';
    email: string = '';
    id: any;
    photoURL: any = 'assets/img/avatar/person.png';
    isOnline: boolean = false;

    constructor(obj?: any) {
        this.name = obj ? obj.name : '';
        this.email = obj ? obj.email : '';
        this.id = obj ? obj.id : '';
        this.photoURL = obj ? obj.photoURL : 'assets/img/avatar/person.png';
        this.isOnline = obj ? obj.isOnline : false;
    }

    public toJSON() {
        return {
            name: this.name,
            email: this.email,
            id: this.id,
            photoURL: this.photoURL,
            isOnline: this.isOnline
        }
    }

    public static fromJSON(json: any): UserProfile {
        return new UserProfile({
            name: json.name,
            email: json.email,
            id: json.id,
            photoURL: json.photoURL,
            isOnline: json.isOnline
        });
    }
}
