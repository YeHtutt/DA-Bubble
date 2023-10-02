import { Injectable } from '@angular/core';
import { UserProfile } from '../models/user-profile';
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

  messageTree: MessagesNode[] = [];
  themes: any;
  unsubMessage: any;


  constructor(public channelService: ChannelService,) {
    this.unsubMessage = this.subMessageList();
  }

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
