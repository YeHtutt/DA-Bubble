import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc, collection, doc, getDoc, query, updateDoc, deleteDoc, getDocs, orderBy, onSnapshot, where
} from '@angular/fire/firestore';
import { Message } from '../models/message';
import { UserProfile } from '../models/user-profile';
import { Channel } from '../models/channel';
import { Router } from '@angular/router';
import { DirectChat } from '../models/direct-chat';
import { NotificationService } from './notification.service';
import { FileUpload } from '../models/file-upload';
import { UsersFirebaseService } from './users-firebase.service';
import { DatePipe } from '@angular/common';
import { FirebaseUtilsService } from './firebase-utils.service';


type ReceiverType = UserProfile | Channel;

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  messages: Message[] = [];
  unsubMessages: any;
  unsubReactions: any;
  currentUserId: any;
  groupedMessages: any = [];

  ngOnDestroy() {
    this.unsubMessages();
    this.unsubReactions();
  }

  constructor(
    private firestore: Firestore = inject(Firestore),
    private router: Router,
    private notificationService: NotificationService,
    private userService: UsersFirebaseService,
    private datePipe: DatePipe,
    private firebaseUtils: FirebaseUtilsService
  ) { this.currentUserId = this.userService.getFromLocalStorage(); }

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

  async sendChannelMessage(receiver: any, message: Message, newMessage: boolean) {
    this.uploadMessage('channel', receiver.channelId, 'message', message);
    if (newMessage) this.router.navigateByUrl('/main/channel/' + receiver.channelId);
  }


  async sendMessageToChannel(origin: string, id: string, message: Message) {
    let path = `${origin}/${id}/message`;
    this.uploadMessageWithPath(path, message);
    if (message) this.router.navigateByUrl('/main/channel/' + id);
  }


  async uploadMessageWithPath(path: string, message: Message) {
    try {
      const docRef = await addDoc(this.firebaseUtils.getColl(path), message.toJSON());
      await updateDoc(docRef, { messageId: docRef.id });
    } catch (error) {
      this.notificationService.showError(`Nachricht konnte nicht gesendet werden`);
    }
  }


  async sendMessageToChat(id: string, message: Message) {
    const chatAlreadyExists = await this.chatExists(this.currentUserId, id);
    if (chatAlreadyExists) {
      const chatId = await this.getExistingChatId(this.currentUserId, id);
      this.router.navigate(['main/chat', chatId]);
      this.uploadMessage('chat', chatId, 'message', message);
    }
    else {
      if (!chatAlreadyExists) {
        let newDirectChat = await this.createDirectChatObject(id).toJSON();
        this.firebaseUtils.addCollWithCustomId(newDirectChat, 'chat', newDirectChat.chatId);
      }
    }
  }

  createDirectChatObject(receiver: string): DirectChat {
    return new DirectChat({
      chatId: `${this.currentUserId}_${receiver}`,
      creationTime: new Date(),
      user1: this.currentUserId,
      user2: receiver,
    });
  }






  async sendNewChatMessage(directChat: any, message: Message, newMessage: boolean) {
    const docId = await this.getChatDocId(directChat);
    this.uploadMessage('chat', docId, 'message', message);
    if (newMessage) this.router.navigateByUrl('/main/chat/' + docId);
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


  async subMessage(coll: string, subId: string) {
    let ref = collection(this.firestore, `${coll}/${subId}/message`);
    const q = query(ref, orderBy('time'));
    this.unsubMessages = onSnapshot(q, async (list) => {
      this.messages = [];
      this.groupedMessages = [];
      for (const message of list.docs) {
        const messageData = Message.fromJSON({ ...message.data(), messageId: message.id });
        this.messages.push(messageData);
      }
      this.groupedMessages = this.groupMessagesByDate(this.messages);
    });
  }


  groupMessagesByDate(messagesToGroup: any) {
    const groupedMessages: any = [];
    let currentDate: string | null = null;
    let index = -1;
    const todayFormatted = this.datePipe.transform(new Date(), 'EEEE, d. MMMM', 'de'); // Get today's date in the same format for comparison
    messagesToGroup.forEach((message: any) => {
      const messageDateObject = (message.time as any).toDate();
      const messageDate = this.datePipe.transform(messageDateObject, 'EEEE, d. MMMM', 'de');
      const displayDate = (messageDate === todayFormatted) ? 'Heute' : messageDate;
      if (displayDate !== currentDate) {
        currentDate = displayDate;
        index++;
        groupedMessages[index] = {
          date: currentDate,
          messages: []
        };
      }
      groupedMessages[index].messages.push({ ...message });
    });
    return groupedMessages;
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
        if (chat.user1 == directChat.user1 && chat.user2 == directChat.user2 || chat.user1 == directChat.user2 && chat.user2 == directChat.user1) {
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
    if (await directChat.chatId.includes(this.currentUserId)) {
      docId = await this.createDirectChat(directChat);
      console.log('true')
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


  // DELETE MESSAGE //

  async deleteMessageDoc(coll: any, docId: any, msgId: string) {
    const msgRef = await this.getMsgDocRef(coll, docId, msgId);
    deleteDoc(msgRef);
  }

  // REACTIONS TO MESSAGES //


  async updateReaction(coll: any, docId: any, msgId: string, reaction: any) {
    const msgRef = await this.getMsgDocRef(coll, docId, msgId);
    updateDoc(msgRef, { reactions: reaction })
  }

  async updateCount(path: any, count: number, time: any) {
    const msgRef = await this.firebaseUtils.getDoc(path);
    updateDoc(msgRef, {
      threadCount: count,
      timeOflastReply: time
    });
  }




  async chatExists(user1: string, user2: string): Promise<boolean> {
    const chatCollection = collection(this.firestore, 'chat');
    const query1 = query(chatCollection, where('user1', '==', user1), where('user2', '==', user2));
    const result1 = await getDocs(query1);
    const query2 = query(chatCollection, where('user1', '==', user2), where('user2', '==', user1));
    const result2 = await getDocs(query2);
    return !result1.empty || !result2.empty;
  }

  async getExistingChatId(user1: string, user2: string): Promise<string> {
    const chatCollection = collection(this.firestore, 'chat');
    const query1 = query(chatCollection, where('user1', '==', user1), where('user2', '==', user2));
    const result1 = await getDocs(query1);
    if (!result1.empty) {
      return result1.docs[0].id;
    }
    const query2 = query(chatCollection, where('user1', '==', user2), where('user2', '==', user1));
    const result2 = await getDocs(query2);
    if (!result2.empty) {
      return result2.docs[0].id;
    }
    return '';
  }

}