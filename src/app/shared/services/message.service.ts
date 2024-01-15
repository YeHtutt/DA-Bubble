import { DatePipe } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc, collection,
  deleteDoc,
  doc, getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query, updateDoc,
  where,
  CollectionReference,
  DocumentData, limit
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Channel } from '../../models/channel';
import { DirectChat } from '../../models/direct-chat';
import { Message } from '../../models/message';
import { UserProfile } from '../../models/user-profile';
import { FirebaseUtilsService } from './firebase-utils.service';
import { NotificationService } from './notification.service';
import { UsersFirebaseService } from './users-firebase.service';


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

  /**
   * Sends a message to either a user or a channel.
   * @param {Message} message - The message to send.
   * @param {UserProfile | Channel} receiver - The receiver of the message, either a user or a channel.
   * @param {boolean} newMessage - Flag indicating if it's a new message.
   */
  async sendMessage(message: Message, receiver: any, newMessage: boolean) {
    try {
      if (receiver instanceof UserProfile) {
        this.createOrConfirmChat(receiver.id, message);
      } else if (receiver instanceof Channel) {
        this.sendMessageToChannel(receiver, message, newMessage);
      }
    } catch (error) {
      this.notificationService.showError(`Es ist ein Netzwerk Fehler aufgetreten: ${error}`);
    }
  }


  async sendMessageToChannel(receiver: any, message: Message, newMessage: boolean) {
    this.uploadMessage('channel', receiver.channelId, 'message', message);
    if (newMessage) this.router.navigateByUrl('/dashboard/channel/' + receiver.channelId);
  }


  /**
  * The function checks if a chat between users already exists or if a new one should be created.
  * @param id id of a user who can receive messages
  * @param message a message Object
  */
  async createOrConfirmChat(id: string, message: Message) {
    const chatAlreadyExists: boolean = await this.chatExists(this.currentUserId, id);
    if (chatAlreadyExists) {
      this.sendMessageToChat(id, message);
    } else {
      if (!chatAlreadyExists) {
        let newDirectChat = this.createDirectChatObject(id).toJSON();
        this.firebaseUtils.addColl(newDirectChat, 'chat', 'chatId');
        this.sendMessageToChat(id, message);
      }
    }
  }


  async sendMessageToChat(id: string, message: Message) {
    const chatId = await this.getExistingChatId(this.currentUserId, id);
    let path = `chat/${chatId}/message`;
    this.uploadMessageWithPath(path, message);
    this.router.navigate(['dashboard/chat', chatId]);
  }


  async uploadMessageWithPath(path: string, message: Message) {
    try {
      const docRef = await addDoc(this.firebaseUtils.getColl(path), message.toJSON());
      await updateDoc(docRef, { messageId: docRef.id });
    } catch (error) {
      this.notificationService.showError(`Nachricht konnte nicht gesendet werden`);
    }
  }


  /**
  * Creates a new direct chat object.
  * @param {string} receiver - The ID of the receiver.
  * @returns {DirectChat} The created DirectChat object.
  */
  createDirectChatObject(receiver: string): DirectChat {
    return new DirectChat({
      chatId: `${this.currentUserId}_${receiver}`,
      creationTime: new Date(),
      user1: this.currentUserId,
      user2: receiver,
    });
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


  /**
  * Subscribes to messages in a collection and groups them by date.
  * @param {string} coll - The collection to subscribe to.
  * @param {string} subId - The sub-collection ID.
  */
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


  /**
   * Groups messages depending on their dates and formats the date with the date pipe.
   * @param {any[]} messagesToGroup - Array of messages to group.
   * @returns {any[]} Grouped messages.
   */
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

  /**
  * Creates a new direct chat.
  * @param {DirectChat} directChat - The direct chat to create.
  * @returns {Promise<string>} The ID of the created chat.
  */
  async createDirectChat(directChat: DirectChat) {
    const itemCollection = collection(this.firestore, 'chat');
    const docRef = await addDoc(itemCollection, directChat.toJSON());
    await updateDoc(docRef, { chatId: docRef.id });
    return docRef.id;
  }


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


  /**
   * The function updates the number of replies in a thread for the parent message.
   * @param path - the path to the message
   * @param count - number of replies in a thread
   * @param time - the time where the last reply was received
   */
  async updateCount(path: any, count: number, time: any) {
    const msgRef = await this.firebaseUtils.getDoc(path);
    updateDoc(msgRef, {
      threadCount: count,
      timeOflastReply: time
    });
  }


  /**
   * The function get the latest reply in a thread and displays it in the corresponding parent message. 
   * @param subCollRef - the message referece.
   * @returns a date where the latest message was created.
   */
  async getLastMessageFromSubcollection(subCollRef: CollectionReference<DocumentData>): Promise<Message | null> {
    const q = query(subCollRef, orderBy('time', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    } else {
      // Assuming that the data is compatible with the Message class structure
      const lastMessage = snapshot.docs[0].data() as Message;
      return new Message(lastMessage);
    }
  }


  /**
  * Checks if a chat already exists between two users.
  * @param {string} user1 - The ID of the first user.
  * @param {string} user2 - The ID of the second user.
  * @returns {Promise<boolean>} True if the chat exists, false otherwise.
  */
  async chatExists(user1: string, user2: string): Promise<boolean> {
    const chatCollection = collection(this.firestore, 'chat');
    const query1 = query(chatCollection, where('user1', '==', user1), where('user2', '==', user2));
    const result1 = await getDocs(query1);
    const query2 = query(chatCollection, where('user1', '==', user2), where('user2', '==', user1));
    const result2 = await getDocs(query2);
    return !result1.empty || !result2.empty;
  }


  /**
  * Retrieves the existing chat ID between two users.
  * @param {string} user1 - The ID of the first user.
  * @param {string} user2 - The ID of the second user.
  * @returns {Promise<string>} The chat ID if it exists, otherwise an empty string.
  */
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