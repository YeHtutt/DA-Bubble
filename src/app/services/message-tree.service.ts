import { Injectable, inject } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ActivatedRoute } from '@angular/router';
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

  messageTree: MessagesNode[] = [];
  themes: any;
  unsubMessage: any;
  currentUserId = this.userService.getFromLocalStorage()

  constructor(
    private firebaseUtils: FirebaseUtilsService,
    private userService: UsersFirebaseService,
    private route: ActivatedRoute,
    private firestore: Firestore = inject(Firestore),
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

  unsubChat: any;

  subUserMessagesList() {
    // We keep a reference to the unsubscribe function
    this.unsubChat = onSnapshot(this.firebaseUtils.getRef('chat'), async (list: any) => {
      // Initialize an empty array for all promises
      let promises = [];
      // Using `for...of` loop instead of `forEach` to handle async/await
      for (const element of list.docs) {
        // Create a promise for each user data retrieval and push it to the promises array
        promises.push(this.processMessageElement(element));
      }

      // Wait for all promises to resolve
      await Promise.all(promises);

      // Now that we have all the data, update the tree
      this.themes = [{ name: 'Direktnachrichten', children: this.messageTree }];
      this.dataSource.data = this.themes;
      this.dataLoaded.next(true);
    });
  }

  // This function processes each element from the list and is designed to be used with async/await
  async processMessageElement(element: any) {
    let currentUser = await this.userService.getFromLocalStorage();
    let user1 = element.data().user1;
    let user2 = element.data().user2;
    let user = currentUser !== user1 ? user1 : user2;
    if (currentUser !== user) {
      let receiver = await this.userService.getUser(user) as UserProfile;
      const messageObj = this.setDirectMessageObj(receiver, element.id);
      this.messageTree.push(messageObj);
    }
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
