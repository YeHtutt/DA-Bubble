import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, query, updateDoc } from '@angular/fire/firestore';
import { Message } from '../models/message';
import { UserProfile } from '../models/user-profile';
import { Channel } from '../models/channel';
import { Router } from '@angular/router';
import { collectionData } from 'rxfire/firestore';

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

  sendMessage(message: Message, receiver: ReceiverType, newMessage: boolean) {
    if (receiver instanceof UserProfile) {
      this.uploadMessage('direct-messages', receiver.id, 'message', message);
      if (newMessage) this.router.navigateByUrl('/main/chat/' + receiver.id);
    } else {
      this.uploadMessage('channels', receiver.channelId, 'channel-message', message);
      if (newMessage) this.router.navigateByUrl('/main/channel/' + receiver.channelId);
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

  // GET MESSAGE

  getChannelMessages(mainColl: string, docId: string | null, subColl: string) {
    const channelMessages$ = collectionData(this.getRefSubcollChannel(mainColl, docId, subColl));
    return channelMessages$
  }

  async addMessage() { }

  displayMessage() {}




}
