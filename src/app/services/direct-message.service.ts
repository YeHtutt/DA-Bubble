import { Injectable, inject } from '@angular/core';
import { UserProfile } from '../models/user-profile';
import { Chat } from '../models/chat';
import { ChannelService } from 'src/app/services/channel.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ActivatedRoute } from '@angular/router';

import {
  Firestore, collection,
  doc, onSnapshot,
  addDoc, getDoc, getDocs, updateDoc,
  deleteDoc, orderBy,
  where, query,
  limit,
  collectionData
} from '@angular/fire/firestore';



//interfaces for mat tree
interface MessagesNode {
  name: string;
  id: any;
  photoURL: any;
  children?: MessagesNode[];
}


interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}


@Injectable({
  providedIn: 'root'
})

export class DirectMessageService {
  firestore: Firestore = inject(Firestore);

  allUsers:any = [];
  allChats:any = [];
  currentUser: UserProfile = new UserProfile;
  currentChat: any;
  chatId: any = '';
  messageTree: MessagesNode[] = [];
  themes: any;
  unsubMessage: any;


  constructor(
    public channelService: ChannelService,
    private userService: UsersFirebaseService,
    private route: ActivatedRoute
    ) {
    this.unsubMessage = this.subMessageList();
  }


  //load all data and create current chat
  async createChat() {
    await this.getCurrentUser();
    this.getAllUsers();
    this.getAllChats();
    this.getCurrentChat();
  }


  async getCurrentUser() {
      await this.userService.getCurrentUser(this.userService.getFromLocalStorage()).then((user: any) => {
      this.currentUser = user;
    });
  }

  async getAllUsers() {
    this.allUsers = await this.userService.getUsers();
  }


  async getAllChats() {
    const itemCollection = collection(this.firestore, 'users/' + this.currentUser.id, '/chats');
    const chatsArray: any[] = [];
    const querySnapshot = await getDocs(itemCollection);
    querySnapshot.forEach(doc => {
      const chats = this.setChatObject(doc.data());
      chatsArray.push(chats);
      this.allChats = chatsArray;
    });
    console.log('alle chats:', this.allChats);
    return chatsArray;
  }


  setChatObject(obj: any): Chat {
    return new Chat({
      name: obj.name || '',
      chatId: obj.chatId || ''
    });
  }


  getCurrentChat() {
    // this.route.paramMap.subscribe(async (params) => {
    //   this.chatId = params.get('userId');
    //   console.log('chatid:', this.chatId);

      //Using the service method to fetch the document data
    //   this.channelService.getDocData('users/message/' + this.currentUser.id, this.chatId).then(chatData => {
    //     this.currentChat = chatData;
    //     console.log('aktueller chat:,', this.currentChat);
    //   }).catch(err => {
    //     console.error("Error fetching channel data:", err);
    //   });
    // });

    // this.channelService.getDocData('users/' + this.currentUser.id, this.currentUser.id).then(chatData => {
    //   this.currentChat = chatData;
    //   console.log('aktueller chat:,', this.currentChat);
    // }).catch(err => {
    //   console.error("Error fetching channel data:", err);
    // });
  }



  getSingleDocRef(col: string, docId: string) {
    return doc(collection(this.firestore, col), docId)
  }


  //the following functions are for rendering the contacts in sidenav with in a mat tree
  private _transformer = (node: MessagesNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      id: node.id,
      photoURL: node.photoURL,
      level: level,
    };
  };


  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );


  treeFlattener = new MatTreeFlattener<MessagesNode, ExampleFlatNode>(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );


  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;


  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


  subMessageList() {
    return this.unsubMessage = onSnapshot(this.channelService.getRef('users'), (list: any) => {
      this.messageTree = [];
      list.forEach((element: any) => {
        const messageObj = this.setMessageObj(element.data(), element.id);
        this.messageTree.push(messageObj);
      });
      this.themes = [{ messageName: 'Messages', children: this.messageTree }];
      this.dataSource.data = this.themes;
    });
  }


  setMessageObj(obj: any, docId: string): MessagesNode {
    return new UserProfile({
      name: obj.name,
      email: obj.email,
      id: docId,
      photoURL: obj.photoURL,
      children: []
    });
  }
}
