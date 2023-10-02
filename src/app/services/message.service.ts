import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private firestore: Firestore = inject(Firestore)) { }

  getRefSubcollChannel(type: string, docId: string, typeMessage: string) {
    return collection(this.firestore, `${type}/${docId}/${typeMessage}`);
  }

  async addMessageToReceiver(type: string, docId: string, typeMessage: string, text: string) {
    console.log(type, docId, text)
    // const docRef = addDoc(this.getRefSubcollChannel(type, docId, typeMessage), message);
  }
}
