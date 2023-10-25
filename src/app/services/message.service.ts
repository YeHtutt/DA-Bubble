import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, query, updateDoc, deleteDoc, getDocs, orderBy, onSnapshot } from '@angular/fire/firestore';
import { Message } from '../models/message';
import { UserProfile } from '../models/user-profile';
import { Channel } from '../models/channel';
import { Router } from '@angular/router';
import { DirectChat } from '../models/direct-chat';
import { NotificationService } from './notification.service';



type ReceiverType = UserProfile | Channel;

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  messages: Message[] = [];
  unsubMessages: any;
  unsubReactions: any


  ngOnDestroy() {
    this.unsubMessages();
    this.unsubReactions();
  }

  constructor(
    private firestore: Firestore = inject(Firestore),
    private router: Router,
    private notificationService: NotificationService
  ) { }

  // SEND MESSAGE //

  async sendMessage(message: Message, receiver: any, newMessage: boolean, directChat: any) {
    try {
      // If a message is sent with new Message to a user & redirect to the chat
      if (receiver instanceof UserProfile) {
        this.sendNewChatMessage(directChat, message, newMessage);
        // if a message is sent with new Message to a channel or inside a channel & redirect to the channel
      } else if (receiver instanceof Channel) {
        this.sendChannelMessage(receiver, message, newMessage);
      }
      else {
        // if a message is sent inside a user chat
        this.sendExcistingChatMessage(receiver, message);
      }
    } catch (error) {
      this.notificationService.showError(`Es ist ein Netzwerk Fehler aufgetreten: ${error}`);
    }
  }


  async sendNewChatMessage(directChat: any, message: Message, newMessage: boolean) {
    const docId = await this.getChatDocId(directChat);
    this.uploadMessage('chat', docId, 'message', message);
    if (newMessage) this.router.navigateByUrl('/main/chat/' + docId);
  }


  async sendChannelMessage(receiver: any, message: Message, newMessage: boolean) {
    this.uploadMessage('channel', receiver.channelId, 'message', message);
    if (newMessage) this.router.navigateByUrl('/main/channel/' + receiver.channelId);
  }



  sendExcistingChatMessage(receiver: string, message: Message) {
    this.uploadMessage('chat', receiver, 'message', message);
  }


  // adds a message to a chat/channel
  async uploadMessage(mainColl: string, docId: string, subColl: string, message: Message) {
    try {
      const docRef = await addDoc(this.getRefSubcollChannel(mainColl, docId, subColl), message.toJSON());
      await updateDoc(docRef, { messageId: docRef.id });
    } catch (error) {
      this.notificationService.showError(`Nachricht konnte nicht gesendet werden`);
    }
  }

  // GET DOC OR COLLECTION REF AND WHOLE DOCUMENTS

  // returns reference 
  getRefSubcollChannel(mainColl: string, docId: string | null, subColl: string) {
    return collection(this.firestore, `${mainColl}/${docId}/${subColl}`);
  }


  // gets a specific direct chat 
  async getDirectChatDoc(docId: string) {
    const docRef = doc(this.firestore, "chat", docId);
    const chatDoc = (await getDoc(docRef)).data();
    return DirectChat.fromJSON(chatDoc);
  }

  // get reference of message document
  async getMsgDocRef(coll: string, docId: string, msgId: string) {
    return doc(this.firestore, `${coll}/${docId}/message/${msgId}`);
  }


  // GET MESSAGE //


  // Gets messages from channel and chat
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

  // DIRECT CHAT FUNKTIONS //

  async getChats() {
    let chats: any[] = [];
    const collref = collection(this.firestore, `chat`);
    const querySnapshot = await getDocs(collref);
    querySnapshot.forEach((doc) => {
      chats.push(doc.data());
    });
    return chats;
  }


  async checkIfChatExists(directChat: DirectChat) {
    const chats = await this.getChats();
    let chatExists: boolean = false;
    if (chats) {
      chats.forEach(chat => {
        if (chat.user1 == directChat.user1 && chat.user2 == directChat.user2) {
          chatExists = chat.chatId;
        } else {
          chatExists = false;
        }
      });
    }
    return chatExists;
  }

  async getChatDocId(directChat: DirectChat) {
    let docId: any;
    if (await this.checkIfChatExists(directChat) == false) {
      docId = await this.createDirectChat(directChat);
    } else {
      docId = await this.checkIfChatExists(directChat);
    }
    return docId;
  }


  // creates a new direct chat with user
  async createDirectChat(directChat: DirectChat) {
    const itemCollection = collection(this.firestore, 'chat');
    const docRef = await addDoc(itemCollection, directChat.toJSON());
    await updateDoc(docRef, { chatId: docRef.id });
    return docRef.id;
  }

  // UPDATE MESSAGE //

  // updates message document with new text
  async updateMessage(coll: any, docId: any, msgId: string, editedMsg: string) {
    const msgRef = await this.getMsgDocRef(coll, docId, msgId);
    updateDoc(msgRef, { text: editedMsg, textEdited: true });
  }


  // async addMessageToCollection(coll: string, docId: string, message: {}) {
  //   // Get reference to the sub-collection inside the specified document
  //   let ref = collection(doc(this.firestore, coll, docId), 'message');
  //   // Add the new message to the sub-collection
  //   await addDoc(ref, message)
  //     .catch((err) => { console.log(err) })
  //     .then((docRef: any) => {
  //       console.log("Message written with ID", docRef?.id)
  //       updateDoc(docRef, { messageId: docRef.id });
  //     });
  // }

  // DELETE MESSAGE //

  async deleteMessageDoc(coll: any, docId: any, msgId: string) {
    const msgRef = await this.getMsgDocRef(coll, docId, msgId);
    deleteDoc(msgRef);
  }

  // REACTIONS TO MESSAGES //

  // async getMessageReactions(coll: any, docId: any, msgId: string) {
  //   const msgRef = await this.getMsgDocRef(coll, docId, msgId);
  //   const msg = await getDoc(msgRef);
  //   const msgObj = msg.data()
  //   return new Message(msgObj);
  // }


  async updateReaction(coll: any, docId: any, msgId: string, reaction: any) {
    const msgRef = await this.getMsgDocRef(coll, docId, msgId);
    updateDoc(msgRef, { reactions: reaction })
  }
}