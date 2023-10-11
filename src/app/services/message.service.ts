import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, query, updateDoc } from '@angular/fire/firestore';
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


  constructor(
    private firestore: Firestore = inject(Firestore),
    private router: Router
  ) { }

  // SEND MESSAGE

  async sendMessage(message: Message, receiver: any, newMessage: boolean, directChat: any) {
    if (receiver instanceof UserProfile) {
      const docId =  await this.createDirectChat(directChat);
      this.uploadMessage('direct-messages', docId, 'message', message);
      if (newMessage) this.router.navigateByUrl('/main/chat/' + docId);
    } else if (receiver instanceof Channel) {
      this.uploadMessage('channels', receiver.channelId, 'channel-message', message);
      if (newMessage) this.router.navigateByUrl('/main/channel/' + receiver.channelId);
    } else {
      this.uploadMessage('direct-messages', receiver, 'message', message);
    }
  }
 

  getRefSubcollChannel(mainColl: string, docId: string | null, subColl: string) {
    return collection(this.firestore, `${mainColl}/${docId}/${subColl}`);
  }


  async uploadMessage(mainColl: string, docId: string, subColl: string, message: Message) {
    console.log('Absender', message.user.id)
    console.log('Empfänger', docId)
    const docRef = await addDoc(this.getRefSubcollChannel(mainColl, docId, subColl), message.toJSON());
    await updateDoc(docRef, { messageId: docRef.id });
  }

  async createDirectChat(directChat: DirectChat) {
    const itemCollection = collection(this.firestore, 'direct-messages');
    const docRef = await addDoc(itemCollection, directChat.toJSON());
    await updateDoc(docRef, { chatId: docRef.id });
    return docRef.id;
  }

  async getDirectChatDoc(docId: string) {
    const docRef = doc(this.firestore, "direct-messages", docId);
    const chatDoc = (await getDoc(docRef)).data();
    return new DirectChat(chatDoc);
  }

  // GET MESSAGE

  getChannelMessages(mainColl: string, docId: string | null, subColl: string) {
    const channelMessages$ = collectionData(this.getRefSubcollChannel(mainColl, docId, subColl));
    return channelMessages$
  }

  async addMessage() { }

  displayMessage() {}




}
