import { Injectable, inject } from '@angular/core';
import {
  Firestore, addDoc, collection, doc, getDoc, query, updateDoc, deleteDoc,
  getDocs, orderBy, onSnapshot
} from '@angular/fire/firestore';
import { Message } from '../models/message';
import { UserProfile } from '../models/user-profile';
import { Channel } from '../models/channel';
import { Router } from '@angular/router';
import { collectionData } from 'rxfire/firestore';
import { DirectChat } from '../models/direct-chat';



type ReceiverType = UserProfile | Channel;

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  docId: string | undefined = '';
  coll: string | undefined = '';

  messages: Message[] = [];
  unsubMessages: any;


  ngOnDestroy() {
    this.unsubMessages();
  }

  constructor(
    private firestore: Firestore = inject(Firestore),
    private router: Router
  ) {
    const url = this.router.url;
    this.getRouteToMsgDoc(url);
  }

  getRouteToMsgDoc(url: string) {
    let urlParts = url.split('/');
    this.docId = urlParts.pop();
    this.coll = urlParts.pop();
  }

  // SEND MESSAGE

  async sendMessage(message: Message, receiver: any, newMessage: boolean, directChat: any) {
    // If a message is sent with new Message to a user & redirect to the chat
    if (receiver instanceof UserProfile) {
      const docId = await this.createDirectChat(directChat);
      this.uploadMessage('chat', docId, 'message', message);
      if (newMessage) this.router.navigateByUrl('/main/chat/' + docId);
      // if a message is sent with new Message to a channel or inside a channel & redirect to the channel
    } else if (receiver instanceof Channel) {
      this.uploadMessage('channel', receiver.channelId, 'message', message);
      if (newMessage) this.router.navigateByUrl('/main/channel/' + receiver.channelId);
    } else {
      // if a message is sent inside a user chat
      this.uploadMessage('chat', receiver, 'message', message);
    }
  }


  // returns reference 
  getRefSubcollChannel(mainColl: string, docId: string | null, subColl: string) {
    return collection(this.firestore, `${mainColl}/${docId}/${subColl}`);
  }


  // adds a message to a chat/channel
  async uploadMessage(mainColl: string, docId: string, subColl: string, message: Message) {
    const docRef = await addDoc(this.getRefSubcollChannel(mainColl, docId, subColl), message.toJSON());
    await updateDoc(docRef, { messageId: docRef.id });
  }


  // creates a new direct chat with user
  async createDirectChat(directChat: DirectChat) {
    const itemCollection = collection(this.firestore, 'chat');
    const docRef = await addDoc(itemCollection, directChat.toJSON());
    await updateDoc(docRef, { chatId: docRef.id });
    return docRef.id;
  }

  

  // gets a specific direct chat 
  async getDirectChatDoc(docId: string) {
    const docRef = doc(this.firestore, "chat", docId);
    const chatDoc = (await getDoc(docRef)).data();
    return DirectChat.fromJSON(chatDoc);
  }

  async getMsgDocRef(msgId: string) {
    return doc(this.firestore, `${this.coll}/${this.docId}/message/${msgId}`);
  }

  // GET MESSAGE

  getChannelMessages(mainColl: string, docId: string | null, subColl: string) {
    const channelMessages$ = collectionData(this.getRefSubcollChannel(mainColl, docId, subColl));
    return channelMessages$
  }

  // UPDATE MESSAGE

  async updateMessage(msgId: string, editedMsg: string) {
    const msgRef = await this.getMsgDocRef(msgId);
    updateDoc(msgRef, { text: editedMsg });
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
      .then((docRef: any) => {
        console.log("Message written with ID", docRef?.id)
        updateDoc(docRef, { messageId: docRef.id });
      });
  }
}