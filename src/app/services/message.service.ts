import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { Message } from '../models/message';


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private firestore: Firestore = inject(Firestore)) { }

  getRefSubcollChannel(type: string, docId: string, typeMessage: string) {
    return collection(this.firestore, `${type}/${docId}/${typeMessage}`);
  }

  async uploadMessage(type: string, docId: string, typeMessage: string, message: Message) {
    console.log(type, docId, message)
    const docRef = addDoc(this.getRefSubcollChannel(type, docId, typeMessage), message.toJSON());
  }
}
