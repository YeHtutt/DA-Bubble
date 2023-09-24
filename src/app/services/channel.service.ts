import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel';
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
  constructor() { }



  async addChannel(item: {}, ref: string) {

  }

  /* This method takes a collection ID and a document ID as parameters and returns a reference to the specified document in the Firestore database. */
  getRef(ref: any) {
    return collection(this.firestore, ref);
  }

}
