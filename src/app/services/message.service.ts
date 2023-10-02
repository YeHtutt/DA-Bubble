import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
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

  sendMessage(message: Message, receiver: ReceiverType) {
    if (receiver instanceof UserProfile) {
      this.uploadMessage('users', receiver.id, 'message', message);
      this.router.navigateByUrl('/main/chat/' + receiver.id);
    } else {
      this.uploadMessage('channels', receiver.channelId, 'channel-message', message);
      this.router.navigateByUrl('/main/channel/' + receiver.channelId);
    }
  }

  getRefSubcollChannel(type: string, docId: string, typeMessage: string) {
    return collection(this.firestore, `${type}/${docId}/${typeMessage}`);
  }

  async uploadMessage(type: string, docId: string, typeMessage: string, message: Message) {
    console.log(type, docId, message)
    const docRef = addDoc(this.getRefSubcollChannel(type, docId, typeMessage), message.toJSON());
  }
}
