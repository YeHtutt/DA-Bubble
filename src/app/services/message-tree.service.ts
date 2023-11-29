import { Injectable } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { FirebaseUtilsService } from './firebase-utils.service';
import { UserProfile } from '../models/user-profile';


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
  photoURL?: any;
  email?: any;
  isOnline?: boolean;
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

export class MessageTreeService {


  unsubChat: any;
  messageTree: MessagesNode[] = [];
  unsubMessage: any;
  themes: any;
  currentUserId = this.userService.getFromLocalStorage()

  constructor(
    private firebaseUtils: FirebaseUtilsService,
    private userService: UsersFirebaseService
  ) {
    this.unsubChat = this.subUserMessagesList();
  }

  ngOnDestroy() {
    this.unsubChat();
  }


  //the following functions are for rendering the contacts in sidenav with a mat tree
  private _transformer = (node: MessagesNode, level: number) => {
    const isExpandable = (node.children && node.children.length > 0) || node.name === 'Neuer Chat';
    return {
      expandable: isExpandable,
      name: node.name,
      id: node.id,
      photoURL: node.photoURL,
      level: level,
      email: node.email,
      isOnline: node.isOnline
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
  public dataLoaded = new BehaviorSubject<boolean>(false);




  subUserMessagesList() {
    return this.unsubChat = onSnapshot(this.firebaseUtils.getColl('users'), (list: any) => {
      this.messageTree = [];
      list.forEach((element: any) => {
        const messageObj = this.setDirectMessageObj(element.data(), element.id);
        let currentUser = this.userService.getFromLocalStorage();
        if (currentUser !== messageObj.id) this.messageTree.push(messageObj);
      });
      this.messageTree.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      this.themes = [{ name: 'Direktnachrichten', children: this.messageTree }];
      this.dataSource.data = this.themes;
      this.dataLoaded.next(true);
    });
  }


 
  setDirectMessageObj(obj: any, docId: string): MessagesNode {
    return new UserProfile({
      name: obj.name,
      email: obj.email,
      id: docId,
      photoURL: obj.photoURL,
      isOnline: obj.isOnline,
      children: []
    });
  }




}
