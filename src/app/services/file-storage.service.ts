import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FileUpload } from '../models/file-upload';
import { Subscription, firstValueFrom, lastValueFrom } from 'rxjs';
import { MessageService } from './message.service';
import { deleteObject } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FileStorageService {

  uploadSubscription: Subscription = new Subscription();

  constructor(
    private storage: AngularFireStorage,
    private messageService: MessageService
  ) { }

  ngOnDestroy() {
    this.uploadSubscription?.unsubscribe();
  }


  async uploadFile(fileUpload: FileUpload): Promise<FileUpload> {
    try {
      const filePath = `uploads/${new Date().getTime()}_${fileUpload.file?.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, fileUpload.file);

      const snapshot = await lastValueFrom(uploadTask.snapshotChanges());

      if (snapshot?.state === 'success') {
        fileUpload.name = fileUpload.file.name;
        fileUpload.path = filePath;
        const updatedFileUpload = await this.getDownloadURL(fileRef, fileUpload);
        return updatedFileUpload;
      } else {
        throw new Error('File upload failed');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getDownloadURL(fileRef: any, fileUpload: FileUpload): Promise<FileUpload> {
    try {
      const url: string = await lastValueFrom(fileRef.getDownloadURL());
      fileUpload.url = url;
      return fileUpload;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  deleteFile(filePath: string) {
    const fileRef = this.storage.ref(filePath);
    try {
      fileRef.delete();
    } catch (error) {
      console.log(error)
    }
  }

}
