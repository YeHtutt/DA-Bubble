import { FlatTreeControl } from '@angular/cdk/tree';
import { Injectable } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';
import { UserProfile } from '../../models/user-profile';
import { FirebaseUtilsService } from './firebase-utils.service';


import {
  onSnapshot
} from '@angular/fire/firestore';


/**
 * Interface for the mat tree
 */
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


/**
 * Service for handling message tree (direct-chat) operations in DABubble.
 * This service integrates with Firebase Firestore for data retrieval and uses Angular Material's tree
 * structures to manage and display message nodes.
 */
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


  /**
  * Transforms message nodes for the tree structure.
  * @param {MessagesNode} node - The message node to transform.
  * @param {number} level - The current level of the node in the tree.
  * @returns {ExampleFlatNode} A transformed node suitable for the flat tree control.
  */
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

  /**
  * Determines if a tree node has children.
  * @param {number} _ - Index of the node.
  * @param {ExampleFlatNode} node - The tree node to check.
  * @returns {boolean} True if the node is expandable (has children), false otherwise.
  */
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;


  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  public dataLoaded = new BehaviorSubject<boolean>(false);



  /**
  * Subscribes to the users collection and updates the message tree data source.
  * This method is responsible for retrieving user data and formatting it for the tree display.
  */
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


  /**
  * Creates a direct message object from a user object.
  * @param {any} obj - The user object to convert.
  * @param {string} docId - The document ID of the user.
  * @returns {MessagesNode} The created direct message node.
  */
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
