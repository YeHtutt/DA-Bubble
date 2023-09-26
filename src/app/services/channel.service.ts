import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Channel, Message } from '../models/channel';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';


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


import {
  Firestore, collection,
  doc, onSnapshot,
  addDoc, updateDoc,
  deleteDoc, orderBy,
  where, query,
  limit,
  collectionData
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})


export class ChannelService {

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubChannel = this.subChannelList();
  }


  channelTree: ChannelsNode[] = [];
  themes: any;
  unsubChannel: any;

  async addChannel(item: {}, ref: string) {
    await addDoc(this.getRef(ref), item)
      .catch((err) => { console.log(err) })
      .then((docRef: any) => { console.log("Document written with ID", docRef?.id) })
  }

  /* This method takes a collection ID and a document ID as parameters and returns a reference to the specified document in the Firestore database. */
  getRef(ref: any) {
    return collection(this.firestore, ref);
  }

  getRefSubcollChannel() {
    return collection(this.firestore, `channels/qWdWhJj21D3vBc2s2fsr/channel_messages`);
  }


  private _transformer = (node: ChannelsNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
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

  subChannelList() {
    return this.unsubChannel = onSnapshot(this.getRef('channels'), (list: any) => {
      this.channelTree = [];
      list.forEach((element: any) => {
        const channelObj = this.setChannelObj(element.data(), element.id);
        this.channelTree.push(channelObj);
      });
      this.themes = [{ channelName: 'Channels', children: this.channelTree }];
      this.dataSource.data = this.themes;
      console.log(this.dataSource.data, this.themes);
    });
}


  setChannelObj(obj: any, docId: string): ChannelsNode {
    return new Channel({
      channelId: docId,
      channelName: obj.channelName,
      creatorId: obj.creatorId,
      description: obj.description,
      creationTime: obj.creationTime,
      createdBy: obj.createdBy,
      children: []
    });
  }




  ngOnDestroy() {
    this.unsubChannel();
  }

  /*   addChannel(newChannel: string, collection: string)  {
      newChannel.toJSON(collection)
    } */

  getDateTime() {
    let dateTime = new Date();
    return dateTime
  }


  getChannelMessages(id: string) {
    const channelMessages$ = collectionData(this.getRefSubcollChannel());
    return channelMessages$
  }

  async addMessageToChannel(message: any) {
    const docRef = addDoc(this.getRefSubcollChannel(), message);
  }





}
