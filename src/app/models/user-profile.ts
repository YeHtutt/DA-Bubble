export class UserProfile {
    name: string = '';
    email: string = '';
    id: any;
    photoURL: any = '../assets/img/avatar/person.png';

    constructor(obj?: any) {
        this.name = obj? obj.name: '';
        this.email = obj? obj.email: '';
        this.id = obj? obj.id: '';
        this.photoURL = obj? obj.photoURL: '';
    }

    public toJSON() {
        return {
            name: this.name,
            email: this.email,
            id: this.id,
            photoURL: this.photoURL,
        }
    }
}
