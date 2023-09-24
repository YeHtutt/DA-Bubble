import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel';



interface ChannelsNode {
  name: string;
  channelId: string;
  children?: ChannelsNode[];
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}


import {
  Firestore, collection,
  doc, onSnapshot,
  addDoc, updateDoc,
  deleteDoc, orderBy,
  where, query,
  limit
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})


export class ChannelService {

  firestore: Firestore = inject(Firestore);
  constructor(/* private channel: Channel */) { }

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


  renderChannelTree() {
    
  }

}
