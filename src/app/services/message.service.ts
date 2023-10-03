import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { Message } from '../models/message';
import { UserProfile } from '../models/user-profile';
import { Channel } from '../models/channel';
import { Router } from '@angular/router';

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
      this.uploadMessage('users', receiver.id, 'message', message);
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
    console.log(mainColl, docId, message)
    const docRef = addDoc(this.getRefSubcollChannel(mainColl, docId, subColl), message.toJSON());
  }

  // GET MESSAGE

  getChannelMessages(mainColl: string, docId: string | null, subColl: string) {
    const channelMessages$ = collectionData(this.getRefSubcollChannel(mainColl, docId, subColl));
    return channelMessages$
  }
}
