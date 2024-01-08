import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, onSnapshot, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../../models/message';
import { DrawerService } from './drawer.service';
import { FirebaseUtilsService } from './firebase-utils.service';


/**
 * Service for handling thread-related (answers on messages) operations in an Angular application.
 * This service manages operations like opening and closing threads, subscribing to replies,
 * adding and updating replies, and fetching updated counts of messages or replies.
 * It integrates with Firestore for data management.
 */
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
  ) { }


  ngOnDestroy() {
    this.unsubReplies();
  }


  /**
   * Opens a thread for a specific message.
   * @param {Message} message - The message to open the thread for.
   */
  openThread(message: Message) {
    this.threadIsOpen = true;
    this._message.next(message);
    if (!this.drawerService.checkScreenSize() && this.drawerService.checkScreenSizeForResponsive(1200) && this.threadIsOpen) this.drawerService.closeWithoutCondition();
  }


  /**
   * Closes the currently open thread.
   */
  closeThread() {
    this.threadIsOpen = false;
    if (!this.drawerService.checkScreenSize() && this.drawerService.checkScreenSizeForResponsive(1440) && !this.drawerService.isDrawerOpen && !this.threadIsOpen) this.drawerService.toggle();
  }


  /**
   * Subscribes to replies within a given path and orders them by time.
   * @param {string} path - The path to subscribe to for replies.
   */
  subReplies(path: string) {
    let ref = collection(this.firestore, path);
    const q = query(ref, orderBy('time'));
    return this.unsubReplies = onSnapshot(q, (list) => {
      this.replies = [];
      list.forEach((reply) => {
        this.replies.push(Message.fromJSON({ ...reply.data(), replyId: reply.id }));
      });
      this.replyCount = this.replies.length;
    });
  }

  
  /**
   * Manually fetches the updated count of messages or replies from a collection path. The promise was necessary to have realtime access on the thread count. 
   * Normally the subReplies should be updating the thread count in the messages. However it seems that an racing condition was causing this error. 
   * @param {string} collPath - The collection path to fetch the count from.
   * @returns {Promise<number>} A promise containing the updated count.
   */
  fetchUpdatedCount(collPath: string) {
    return new Promise((resolve, reject) => {
      const ref = collection(this.firestore, collPath);
      const q = query(ref, orderBy('time'));    
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


  /**
   * Adds a reply to a collection within a given path.
   * @param {string} path - The path to add the reply to.
   * @param {Object} message - The message object representing the reply.
   */
  async addReplyToCollection(path: string, message: {}) {
    let ref = collection(this.firestore, path);
    await addDoc(ref, message)
      .catch((err) => { console.log(err) })
      .then((docRef: any) => {       
        updateDoc(docRef, { replyId: docRef.id });
      });
  }


  /**
   * Updates a specific reply within a collection.
   * @param {string} path - The path of the collection containing the reply.
   * @param {Message} reply - The reply message to update.
   */
  async updateReply(path: string, reply: Message) {
    if (reply.messageId) {
      let docRef = this.firebaseService.getSingleDocRef(`${path}`, reply.messageId);
      await updateDoc(docRef, reply.toJSON())
    }
  }


  /**
   * Updates a document in a collection.
   * @param {string} path - The path of the collection (channel or message) containing the document.
   * @param {any} doc - The document to update.
   * @param {string} idField - The field that contains the document's ID.
   * @param {any} updatedFields - The fields to update in the document.
   */
  async updateDoc(path: string, doc: any, idField: string, updatedFields: any) {
    if (doc[idField]) {    
      let docRef = this.firebaseService.getSingleDocRef(path, doc[idField]);
      await updateDoc(docRef, { ...updatedFields });
    }
  }
}