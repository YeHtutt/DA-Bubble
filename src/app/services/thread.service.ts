import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, onSnapshot, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../models/message';
import { DrawerService } from './drawer.service';
import { FirebaseUtilsService } from './firebase-utils.service';


@Injectable({
  providedIn: 'root'
})


export class ThreadService {

  unsubReplies: any;
  replies: Message[] = [];
  replyCount: number = 0;
  threadIsOpen: boolean = false;
  private _message = new BehaviorSubject<Message>(new Message());
  message$ = this._message.asObservable();

  constructor(
    private firestore: Firestore = inject(Firestore),
    private firebaseService: FirebaseUtilsService,
    private drawerService: DrawerService
  ) {}


  ngOnDestroy() {
    this.unsubReplies();
  }


  openThread(message: Message) {
    this.threadIsOpen = true;
    this._message.next(message);
    if (!this.drawerService.checkScreenSize() && this.drawerService.checkScreenSizeForResponsive(1200) && this.threadIsOpen) this.drawerService.closeWithoutCondition();
  }


  closeThread() {
    this.threadIsOpen = false;
    if (!this.drawerService.checkScreenSize() && this.drawerService.checkScreenSizeForResponsive(1440) && !this.drawerService.isDrawerOpen && !this.threadIsOpen) this.drawerService.toggle();
  }


  subReplies(path: string) {
    let ref = collection(this.firestore, path);
    const q = query(ref, orderBy('time'));
    return this.unsubReplies = onSnapshot(q, (list) => {
      this.replies = [];
      list.forEach((reply) => {
        this.replies.push(Message.fromJSON({ ...reply.data(), replyId: reply.id }));
      });
      this.replyCount = this.replies.length; // Update the replyCount here
      //console.log('reply' + this.replyCount);
    });
  }

  // Function to manually fetch the updated count of messages/replies.
  fetchUpdatedCount(collPath: string) {
    return new Promise((resolve, reject) => {
      const ref = collection(this.firestore, collPath);
      const q = query(ref, orderBy('time'));

      // Get the snapshot once instead of subscribing to changes.
      getDocs(q)
        .then(snapshot => {
          const count = snapshot.size; // Get the count from the snapshot.
          resolve(count);
        })
        .catch(error => {
          reject(error);
        });
    });
  }


  async addReplyToCollection(path: string, message: {}) {
    let ref = collection(this.firestore, path);
    await addDoc(ref, message)
      .catch((err) => { console.log(err) })
      .then((docRef: any) => {
        //console.log("Thread written with ID", docRef?.id)
        updateDoc(docRef, { replyId: docRef.id });
      });
  }


  async updateReply(path: string, reply: Message) {
    if (reply.messageId) {
      //console.log(path, reply)
      let docRef = this.firebaseService.getSingleDocRef(`${path}`, reply.messageId);
      await updateDoc(docRef, reply.toJSON())
    } else {
      //console.error("Channel ID is missing");
    }
  }


  async updateDoc(path: string, doc: any, idField: string, updatedFields: any) {
    if (doc[idField]) {
      //console.log(path, doc);
      let docRef = this.firebaseService.getSingleDocRef(path, doc[idField]);
      await updateDoc(docRef, { ...updatedFields });
    } else {
      //console.error("ID is missing");
    }
  }
}