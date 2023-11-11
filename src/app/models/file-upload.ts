export class FileUpload {
    name: string = '';
    url: string = '';
    path: string = '';
    file: File;

    constructor(file: File) {
        this.file = file;
    }

    public toJSON() {
        return {
            name: this.name,
            url: this.url,
            path: this.path
        };
    }
}
