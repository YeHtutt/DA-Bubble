import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FileUpload } from '../models/file-upload';
import { finalize } from 'rxjs';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class FileStorageService {

  constructor(
    private storage: AngularFireStorage,
    private messageService: MessageService
    ) { }

  uploadFile(fileUpload: FileUpload) {
    const filePath = `uploads/${new Date().getTime()}_${fileUpload.file.name}`; 
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(downloadURL => {
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
        });
      })
    ).subscribe();
  }


  downloadURL(filePath: string) {
    const ref = this.storage.ref(filePath);
    return ref.getDownloadURL(); 
  }

}
