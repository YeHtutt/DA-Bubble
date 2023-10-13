
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../models/message';

import {
  Firestore, collection,
  doc, onSnapshot,
  addDoc, getDoc, updateDoc,
  deleteDoc, orderBy,
  where, query,
  limit,
  collectionData,
  getDocs
} from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirebaseUtilsService {

  constructor() { }
  firestore: Firestore = inject(Firestore);


  messages: Message[] = [];
  unsubMessages: any;


  ngOnDestroy() {
    this.unsubMessages();
  }


  async addColl(item: {}, ref: string, fieldId: string) {
    try {
      const docRef = await addDoc(this.getRef(ref), item);
      console.log("Document written with ID", docRef.id);
      // Update the document with the ID
      await updateDoc(docRef, { [fieldId]: docRef.id });
    } catch (err) {
      console.log(err);
    }
  }



  /* This method takes a collection ID and a document ID as parameters and returns a reference to the specified document in the Firestore database. */
  getRef(ref: any) {
    return collection(this.firestore, ref);
  }


  /**
   * @param col collection name
   * @param docId id of the document
   * @returns a reference to the doc
   */

  getSingleDocRef(col: string, docId: string) {
    return doc(collection(this.firestore, col), docId)
  }


  async getDocData(col: string, docId: string) {
    let docRef = this.getSingleDocRef(col, docId);

    // Fetch the actual document data using the getDoc method
    const docSnapshot = await getDoc(docRef);

    // Check if the document exists and print its data
    if (docSnapshot.exists()) {
      return docSnapshot.data();
    } else {
      return console.log("No such document!");
    }
  }


  getDateTime() {
    let dateTime = new Date();
    return dateTime
  }

  subMessage(coll: string, subId: string) {
    // Target the 'message' subcollection under the specified document ID
    let ref = collection(this.firestore, `${coll}/${subId}/message`);
    const q = query(ref, orderBy('time'));
    return this.unsubMessages = onSnapshot(q, (list) => {
      this.messages = [];
      list.forEach((message) => {
        this.messages.push(Message.fromJSON({ ...message.data(), messageId: message.id }));
      });
    });
  }


  async addMessageToCollection(coll: string, docId: string, message: {}) {
    // Get reference to the sub-collection inside the specified document
    let ref = collection(doc(this.firestore, coll, docId), 'message');
    // Add the new message to the sub-collection
    await addDoc(ref, message)
      .catch((err) => { console.log(err) })
      .then((docRef: any) => { console.log("Message written with ID", docRef?.id) });
  }


  async getMessagesFromDoc(col: string, docId: string) {
    // Create a reference to the 'message' subcollection under the specified document ID
    let ref = collection(this.firestore, `${col}/${docId}/message`);

    // Fetch the messages from the subcollection using getDocs
    const querySnapshot = await getDocs(ref);

    // Convert the messages to the Message[] format
    const messages: Message[] = querySnapshot.docs.map(doc => Message.fromJSON({ ...doc.data(), messageId: doc.id }));

    return messages;
  }


  async deleteCollection(colId: string, docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId))
      .catch((err) => { console.log(err) })
  }


}
