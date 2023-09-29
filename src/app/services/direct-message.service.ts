import { Injectable } from '@angular/core';
import { Message } from '../models/channel';
import { ChannelService } from 'src/app/services/channel.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import {
  Firestore, collection,
  doc, onSnapshot,
  addDoc, getDoc, updateDoc,
  deleteDoc, orderBy,
  where, query,
  limit,
  collectionData
} from '@angular/fire/firestore';


interface MessagesNode {
  messageName: string;
  messageId: string;
  children?: MessagesNode[];
}

interface ExampleFlatNode {
  expandable: boolean;
  messageName: string;
  level: number;
}


@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {

  messageTree: MessagesNode[] = [];
  themes: any;
  unsubMessage: any;


  constructor(public channelService: ChannelService,) {
    this.unsubMessage = this.subMessageList();
  }

  private _transformer = (node: MessagesNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      messageName: node.messageName,
      messageId: node.messageId,
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
        const channelObj = this.setChannelObj(element.data(), element.id);
        this.messageTree.push(channelObj);
      });
      this.themes = [{ channelName: 'Channels', children: this.messageTree }];
      this.dataSource.data = this.themes;
    });
  }

  setMessageObj(obj: any, docId: string): MessagesNode {
    return new Message({
      channelId: docId,
      channelName: obj.channelName,
      creatorId: obj.creatorId,
      description: obj.description,
      creationTime: obj.creationTime,
      createdBy: obj.createdBy,
      children: []
    });
  }
}
