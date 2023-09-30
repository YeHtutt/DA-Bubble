import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';
import { UserProfile } from '../models/user-profile';


interface User {
  name: string;
  email: string;
  docId?: string;
  uid?: string;
  photoURL?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersFirebaseService {


  constructor(private firestore: Firestore) { }

  async addUserToFirebase(user: any) {
    try {
      const docRef = await addDoc(collection(this.firestore, 'users'), user);
      //console.log('user saved successfully - ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error of saving users in Firebase:', error);
      throw error;
    }
  }

  saveToLocalStorage(value: any) {
    localStorage.setItem('currentUser', value);
  }

  async getUsers() {
    const itemCollection = collection(this.firestore, 'users');
    const usersArray: any[] = [];
    const querySnapshot = await getDocs(itemCollection);
    querySnapshot.forEach(doc => {
      const users = this.setUserObject(doc.data(), doc.id);
      usersArray.push(users);
    });
    return usersArray;
  }

  setUserObject(obj: any, id: string): User {
    return new UserProfile({
      name: obj.name || '',
      email: obj.email || '',
      docId: id || '',
      uid: obj.id || '',
      photoURL: obj.photoURL || ''
    });
  }

}
