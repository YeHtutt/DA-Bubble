export class FileUpload {
    name: string = '';
    url: string = '';
    file: File;

    constructor(file: File) {
        this.file = file;
    }

    public toJSON() {
        return {
            name: this.name,
            url: this.url,
            file: this.file
        };
    }
}
