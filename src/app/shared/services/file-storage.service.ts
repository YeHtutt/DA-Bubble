import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Subscription, lastValueFrom } from 'rxjs';
import { FileUpload } from '../../models/file-upload';


/**
 * Service for handling file uploads and deletions using AngularFireStorage.
 * This service provides methods to upload files to Firebase Storage, retrieve
 * download URLs, and delete files from storage.
 */
@Injectable({
  providedIn: 'root'
})
export class FileStorageService {

  uploadSubscription: Subscription = new Subscription();

  constructor(
    private storage: AngularFireStorage,
  ) { }


  ngOnDestroy() {
    this.uploadSubscription?.unsubscribe();
  }


  /**
  * Uploads a file to Firebase Storage and returns the file upload details including the download URL.
  * @param {FileUpload} fileUpload - The file upload object containing the file and metadata.
  * @returns {Promise<FileUpload>} A promise that resolves to the updated FileUpload object with the download URL.
  * @throws Throws an error if the upload fails.
  */
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
      throw error;
    }
  }


  /**
   * Retrieves the download URL for a file stored in Firebase Storage.
   * @param {any} fileRef - The reference to the file in Firebase Storage.
   * @param {FileUpload} fileUpload - The file upload object to update with the download URL.
   * @returns {Promise<FileUpload>} A promise that resolves to the FileUpload object with the download URL.
   * @throws Throws an error if retrieving the download URL fails.
   */
  async getDownloadURL(fileRef: any, fileUpload: FileUpload): Promise<FileUpload> {
    try {
      const url: string = await lastValueFrom(fileRef.getDownloadURL());
      fileUpload.url = url;
      return fileUpload;
    } catch (error) {
      throw error;
    }
  }


  /**
  * Deletes a file from Firebase Storage.
  * @param {string} filePath - The path of the file in Firebase Storage to delete.
  * @throws Throws an error if the deletion fails.
  */
  deleteFile(filePath: string) {
    const fileRef = this.storage.ref(filePath);
    try {
      fileRef.delete();
    } catch (error) {
      throw error;
    }
  }
}