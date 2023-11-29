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
  channelContent: Channel[] = [];
  channelTree: ChannelsNode[] = [];
  channels: Channel[] = [];
  themes: any;
  unsubChannel: any;
  unsubChannels: any;
  unsubChannelTree: any;
  unsubMessage: any;
  unsubChannelContent: any;
  currentUserId = this.userService.getFromLocalStorage()

  
  constructor(
    private firebaseUtils: FirebaseUtilsService,
    private userService: UsersFirebaseService,
    private notificationService: NotificationService) {
    this.unsubChannelTree = this.subChannelTree();
  }


  ngOnDestroy() {
    this.unsubChannelTree();
    this.unsubChannel();
    this.unsubChannelContent();
    this.unsubChannels();
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


  getAllChannels() {
    return this.unsubChannelTree = onSnapshot(this.firebaseUtils.getColl('channel'), (list: any) => {
      list.forEach((element: any) => {
        const channelObj = this.setChannelObj(element.data(), element.id);
        this.channels.push(channelObj);
      });
      this.dataSource.data
      this.dataLoaded.next(true);
    });
  }

  subChannelTree() {
    return this.unsubChannelTree = onSnapshot(this.firebaseUtils.getColl('channel'), (list: any) => {
      this.channelTree = [];
      this.populateChannelsAndMore(list);
      this.updateDataSource();
      this.dataLoaded.next(true);
    });
  }


  populateChannelsAndMore(list: any) {
    let moreChannels: ChannelsNode[] = [];
    list.forEach((element: any) => {
      const channelObj = this.setChannelObj(element.data(), element.id);
      const containsCurrentUser = channelObj.usersData.some((user: any) => user.id === this.currentUserId);
      if (containsCurrentUser) this.channelTree.push(channelObj);
      else moreChannels.push(channelObj);
    });
    this.sortChannelTree();
    this.appendMoreChannels(moreChannels);
  }


  sortChannelTree() {
    this.channelTree.sort((a, b) => a.channelName.toLowerCase().localeCompare(b.channelName.toLowerCase()));
  }


  appendMoreChannels(moreChannels: ChannelsNode[]) {
    if (moreChannels.length) {
      this.channelTree.push({
        channelName: 'Weitere',
        children: moreChannels,
        channelId: 'weitere-id'
      });
    }
  }


  updateDataSource() {
    this.themes = [{ channelName: 'Channel', children: this.channelTree }];
    this.dataSource.data = this.themes;
  }


  expandChannels() {
    const firstNode = this.treeControl.dataNodes[0];
    if (firstNode) {
      this.treeControl.expand(firstNode);
    }
  }


  subChannelContent(documentId: string, callback: (channelData: any) => void) {
    const docRef = doc(this.firebaseUtils.getColl('channel'), documentId);
    return onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback(docSnapshot.data());
      } else {
        this.notificationService.showError('Der Channel existiert nicht')
      }
    });
  }


  async updateChannel(channel: Channel) {
    if (channel.channelId) {
      const docRef = this.firebaseUtils.getSingleDocRef('channel', channel.channelId);
      const plainChannelObject = channel.toJSON();
      await updateDoc(docRef, plainChannelObject);
    } else {
      //console.error("Channel ID is missing");
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
