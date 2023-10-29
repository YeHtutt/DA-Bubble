import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FileUpload } from '../models/file-upload';
import { Subscription, catchError, finalize, of, tap } from 'rxjs';
import { MessageService } from './message.service';

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

  uploadFile(fileUpload: FileUpload) {
    const filePath = `uploads/${new Date().getTime()}_${fileUpload.file.name}`; 
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);

    this.uploadSubscription = uploadTask.snapshotChanges().pipe(
      tap(snapshot => {
        if(snapshot?.state === 'success') {
          this.getDownloadURL(fileRef); 
        }
      }), catchError(error =>{
        console.log(error);
        return of(null)
      })  
    ).subscribe();
  }


  getDownloadURL(fileRef: any) {
    fileRef.getDownloadURL().subscribe({next: (url: string) => {
      console.log(url); 
    },
    error: (error: Error) => {
      console.log(error)
    },
    complete: () => {
      this.uploadSubscription.unsubscribe();
    }
  });
  }

}
