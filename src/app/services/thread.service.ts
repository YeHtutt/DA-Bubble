import { Injectable, inject } from '@angular/core';
import { Message } from '../models/message';
import { BehaviorSubject } from 'rxjs';
import { Firestore, addDoc, collection, doc, getDoc, query, updateDoc, deleteDoc, getDocs, orderBy, onSnapshot, arrayUnion } from '@angular/fire/firestore';
import { Thread } from '../models/thread';



@Injectable({
  providedIn: 'root'
})


export class ThreadService {


  constructor(private firestore: Firestore = inject(Firestore)) { }

  unsubThread: any;
  threads: Thread[] = [];

  ngOnDestroy() {
    this.unsubThread();
  }

  threadIsOpen: boolean = false;

  private _message = new BehaviorSubject<Message>(new Message());
  message$ = this._message.asObservable();

  openThread(message: Message) {
    this.threadIsOpen = true;
    this._message.next(message);
  }

  closeThread() {
    this.threadIsOpen = false;
  }

  subThread(col: string, docId: string, messageId: string) {
   console.log(col)
    // Create a reference to the 'message' subcollection under the specified document ID
    let ref = collection(this.firestore, `${col}/${docId}/message/${messageId}/thread`);

    // Listen for real-time updates to the specified query
    this.unsubThread = onSnapshot(ref, (querySnapshot) => {
      const threads: Thread[] = querySnapshot.docs.map(doc => Thread.fromJSON({ ...doc.data(), threadId: doc.id }));
      // Here you'd typically update a local state variable or call another function 
      // For now, let's just log the threads to the console
      console.log(threads);
    });
  }

  async getThreadFromDoc(col: string, docId: string, messageId: string) {
    // Create a reference to the 'message' subcollection under the specified document ID
    let ref = collection(this.firestore, `${col}/${docId}/message/${messageId}/thread`);
    // Fetch the messages from the subcollection using getDocs
    const querySnapshot = await getDocs(ref);
    // Convert the messages to the Message[] format
    const thread: Thread[] = querySnapshot.docs.map(doc => Thread.fromJSON({ ...doc.data(), threadId: doc.id }));
    return thread;
  }


  async addMessageToCollection(coll: string, docId: string, messageId: string, message: {}) {
    // Get reference to the sub-collection inside the specified document
    let ref = collection(this.firestore, `${coll}/${docId}/message/${messageId}/thread`);
    // Add the new message to the sub-collection
    await addDoc(ref, message)
      .catch((err) => { console.log(err) })
      .then((docRef: any) => {
        console.log("Thread written with ID", docRef?.id)
        updateDoc(docRef, { threadId: docRef.id });
      });
  }




}
