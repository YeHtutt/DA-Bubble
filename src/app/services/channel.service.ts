import { Injectable, inject } from '@angular/core';
import { Channel } from '../models/channel';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { FirebaseUtilsService } from './firebase-utils.service';
import { UsersFirebaseService } from './users-firebase.service';
import { NotificationService } from './notification.service';


import {
  Firestore, collection,
  doc, onSnapshot,
  addDoc, getDoc, updateDoc,
  deleteDoc, orderBy,
  where, query,
  limit,
  collectionData,
  getDocs
} from '@angular/fire/firestore';


interface ChannelsNode {
  channelName: string;
  channelId: string;
  children?: ChannelsNode[];
}

interface ExampleFlatNode {
  expandable: boolean;
  channelName: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})


export class ChannelService {

  firestore: Firestore = inject(Firestore);

  constructor(
    private firebaseUtils: FirebaseUtilsService,
    private userService: UsersFirebaseService,
    private notificationService: NotificationService) {
    this.unsubChannelTree = this.subChannelList();
  }

  channelContent: Channel[] = [];
  channelTree: ChannelsNode[] = [];
  themes: any;
  unsubChannel: any;
  unsubChannelTree: any;
  unsubMessage: any;
  unsubChannelContent: any;
  currentUserId = this.userService.getFromLocalStorage()

  ngOnDestroy() {
    this.unsubChannelTree();
    this.unsubChannel();
    this.unsubChannelContent();
  }




  private _transformer = (node: ChannelsNode, level: number) => {
    const isExpandable = (node.children && node.children.length > 0) || node.channelName === 'Weitere';
    return {
      expandable: isExpandable,
      channelName: node.channelName,
      channelId: node.channelId,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener<ChannelsNode, ExampleFlatNode>(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  public dataLoaded = new BehaviorSubject<boolean>(false);


  subChannelList() {
    let weitereChannels: ChannelsNode[] = [];

    return this.unsubChannelTree = onSnapshot(this.firebaseUtils.getRef('channel'), (list: any) => {
      this.channelTree = [];
      list.forEach((element: any) => {
        const channelObj = this.setChannelObj(element.data(), element.id);
        const containsCurrentUser = channelObj.usersData.some((user: any) => user.id === this.currentUserId);

        if (containsCurrentUser) {
          this.channelTree.push(channelObj);
        } else {
          weitereChannels.push(channelObj);
        }
      });
      this.channelTree.sort((a, b) => a.channelName.toLowerCase().localeCompare(b.channelName.toLowerCase()));

      const mainTree: ChannelsNode[] = [
        {
          channelName: 'Channel',
          channelId: 'channel-id',  // Give this a unique ID, or adjust as needed
          children: this.channelTree
        }
      ];

      if (weitereChannels.length && mainTree[0].children !== undefined) {
        mainTree[0].children.push({
          channelName: 'Weitere',
          channelId: 'weitere-id',  // Optional, added an id for the Weitere node. Adjust as needed.
          children: weitereChannels
        });
      }

      this.dataSource.data = mainTree;
      this.dataLoaded.next(true);  // Emit event when data is loaded
    });
  }



  subChannelContent(documentId: string, callback: (channelData: any) => void) {
    const docRef = doc(this.firebaseUtils.getRef('channel'), documentId);
    return onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback(docSnapshot.data());
      } else {
        console.log('Document does not exist!');
      }
    });
  }



  async updateChannel(channel: Channel) {
    if (channel.channelId) {
      const docRef = this.firebaseUtils.getSingleDocRef('channel', channel.channelId);
      const plainChannelObject = channel.toJSON();
      await updateDoc(docRef, plainChannelObject);
    } else {
      console.error("Channel ID is missing");
    }
  }


  setChannelObj(obj: any, docId: string): any {
    return new Channel({
      channelId: docId,
      channelName: obj.channelName,
      creator: obj.creator,
      description: obj.description,
      creationTime: obj.creationTime,
      usersData: obj.usersData,
      children: []
    });
  }


  setChannelContentObj(obj: any, docId: string): Channel {
    const channelJSON = { ...obj, channelId: docId };
    console.log(channelJSON);
    return Channel.fromJSON(channelJSON);
  }


  async getChannels() {
    const itemCollection = collection(this.firestore, 'channel');
    const channelArray: any[] = [];
    const querySnapshot = await getDocs(itemCollection);
    querySnapshot.forEach(doc => {
      const channel = this.setChannelObj(doc.data(), doc.id);
      channelArray.push(channel);
    });
    return channelArray;
  }


  async getSingleChannel(docId: string) {
    const docRef = doc(this.firestore, "channel", docId);
    const channelDoc = (await getDoc(docRef)).data();
    return Channel.fromJSON(channelDoc);
  }
}
