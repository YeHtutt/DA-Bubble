import { Injectable } from '@angular/core';
import { UserProfile } from '../models/user-profile';
import { ChannelService } from 'src/app/services/channel.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

import {
  Firestore, collection,
  doc, onSnapshot,
  addDoc, getDoc, updateDoc,
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
  allUsers:any = [];
  currentUser: UserProfile = new UserProfile;
  messageTree: MessagesNode[] = [];
  themes: any;
  unsubMessage: any;


  constructor(
    public channelService: ChannelService,
    private userService: UsersFirebaseService,
    ) {
    this.unsubMessage = this.subMessageList();
  }


  //load current user
  createChat() {
    this.getCurrentUser();
    this.getAllUsers();
  }


  getCurrentUser() {
    this.userService.getCurrentUser(this.userService.getFromLocalStorage()).then((user: any) => {this.currentUser = user});
    console.log('chat test:', this.currentUser);
  }

  async getAllUsers() {
    this.allUsers = await this.userService.getUsers();
    console.log('all users:', this.allUsers);
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
