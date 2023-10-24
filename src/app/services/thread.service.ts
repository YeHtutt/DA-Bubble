import { Injectable, inject } from '@angular/core';
import { Message } from '../models/message';
import { BehaviorSubject } from 'rxjs';
import { Firestore, addDoc, collection, doc, getDoc, query, updateDoc, deleteDoc, getDocs, orderBy, onSnapshot, arrayUnion } from '@angular/fire/firestore';
import { Reply } from '../models/thread';
import { FirebaseUtilsService } from './firebase-utils.service';


@Injectable({
  providedIn: 'root'
})


export class ThreadService {


  constructor(
    private firestore: Firestore = inject(Firestore),
    private firebaseService: FirebaseUtilsService
  ) { }

  unsubReplies: any;
  replies: Reply[] = [];

  ngOnDestroy() {
    this.unsubReplies();
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

  subReplies(path: string) {
    let ref = collection(this.firestore, path);
    const q = query(ref, orderBy('time'));
    return this.unsubReplies = onSnapshot(q, (list) => {
      this.replies = [];
      list.forEach((reply) => {
        this.replies.push(Reply.fromJSON({ ...reply.data(), replyId: reply.id }));
      });
    });
  }


  deleteReply() { }

  /*  
  ref `${coll}/${docId}/message/${messageId}/thread`
  */

  async addReplyToCollection(path: string, message: {}) {
    // Get reference to the sub-collection inside the specified document
    let ref = collection(this.firestore, path);
    // Add the new message to the sub-collection
    await addDoc(ref, message)
      .catch((err) => { console.log(err) })
      .then((docRef: any) => {
        console.log("Thread written with ID", docRef?.id)
        updateDoc(docRef, { replyId: docRef.id });
      });
  }


  async updateReply(reply: Reply, coll: string, docId: string, messageId: string) {
    if (reply.replyId) {
      let docRef = this.firebaseService.getSingleDocRef(`${coll}/${docId}/message/${messageId}/thread`, reply.replyId);
      await updateDoc(docRef, reply.toJSON())
        .catch((err) => { console.log(err); })
        .then(() => { });
    }
  }

}
