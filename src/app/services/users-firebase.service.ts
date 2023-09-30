import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, setDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { UserProfile } from '../models/user-profile';
import { Auth } from '@angular/fire/auth';
import { docData } from 'rxfire/firestore';
import { map } from 'rxjs';


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
  picURL: any;
  user: UserProfile = new UserProfile;
  id: any;
  loginID: any;

  constructor(private firestore: Firestore, private auth: Auth) { }

  async addUserToFirebase(user: any) {
    try {
      const docRef = await addDoc(collection(this.firestore, 'users'), user);
      //console.log('user saved successfully - ID:', docRef.id);
      this.id = docRef.id;
      this.saveToLocalStorage(this.id);
      //localStorage.setItem('currentUser', this.id);
      return docRef.id;
    } catch (error) {
      console.error('Error of saving users in Firebase:', error);
      throw error;
    }
  }

  /*
  saveToLocalStorage(value: any) {
    localStorage.setItem('currentUser', value);
  }*/


  saveToLocalStorage(idValue: any) {
    localStorage.setItem('currentUser', idValue);
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




  async saveUserPic(image: any) {
    this.user.photoURL = image;
    console.log('img path:', this.user.photoURL);
    console.log('auth ID:', this.auth.currentUser?.uid);

    const docRef = doc(this.firestore, 'users', `${this.id}`);
    console.log(docRef);
    await updateDoc(docRef, {
      photoURL: image
    }
    )
  }

  /*
  getCurrentUser() {
    const docRef = doc(this.firestore, 'users', 'xzYmGNA9f2PSTIScvGn7');
    this.loginID = docRef.id; // gibt immer ID vom User zurück
    this.saveToLocalStorage(this.loginID);
    //return docData(docRef).pipe(map(data => data as User)); // gibt immer Daten vom Typ User zurück
  }*/

}

