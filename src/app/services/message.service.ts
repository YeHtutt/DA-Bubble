import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc } from '@angular/fire/firestore';
import { collection } from 'rxfire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private firestore: Firestore = inject(Firestore)) { }

  async addMessageToReceiver() {
  
  }
}
