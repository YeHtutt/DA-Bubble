import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UsersFirebaseService {

  constructor(private firestore: Firestore) { }

  async addUserToFirebase(user: any) {
    try {
      const docRef = await addDoc(collection(this.firestore, 'users'), user);
      console.log('user saved successfully - ID:', docRef.id);
      return docRef.id;
    }catch (error) {
      console.error('Error of saving users in Firebase:', error);
      throw error;
    }
  }
}
