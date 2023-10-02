import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, setDoc, doc, onSnapshot, getDoc } from '@angular/fire/firestore';
import { UserProfile } from '../models/user-profile';
import { Auth } from '@angular/fire/auth';
import { docData } from 'rxfire/firestore';
import { map } from 'rxjs';


interface User {
  name: string;
  email: string;
  id?: string;
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

  async addUserToFirebase(user: any, uid: string) {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      console.log(user)
      await setDoc(userRef, user);
      this.saveToLocalStorage(uid);
      this.id = uid;
    } catch (error) {
      console.error('Error of saving users in Firebase:', error);
      throw error;
    }
  }


  saveToLocalStorage(idValue: any) {
    localStorage.setItem('currentUser', idValue);
  }

  getFromLocalStorage() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser;
  }

  async getUsers() {
    const itemCollection = collection(this.firestore, 'users');
    const usersArray: any[] = [];
    const querySnapshot = await getDocs(itemCollection);
    querySnapshot.forEach(doc => {
      const users = this.setUserObject(doc.data());
      usersArray.push(users);
    });
    return usersArray;
  }

  async getCurrentUser(uid: any) {
    const itemDoc = doc(this.firestore, 'users', uid);
    const querySnapshot = await getDoc(itemDoc);
    const user = this.setUserObject(querySnapshot.data())
    return user;
  }

  setUserObject(obj: any): User {
    return new UserProfile({
      name: obj.name || '',
      email: obj.email || '',
      id: obj.id || '',
      photoURL: obj.photoURL || ''
    });
  }

  async checkIfSubcollectionExists(documentPath: string): Promise<boolean> {
    const subcollectionRef = collection(this.firestore, documentPath);
    const snapshot = await getDocs(subcollectionRef);
    console.log(snapshot)
    return !snapshot.empty;
  }


  async saveUserPic(image: any) {
    this.user.photoURL = image;
    const docRef = doc(this.firestore, 'users', `${this.id}`);
    await updateDoc(docRef, {
      photoURL: image
    }
    );
  }

  /*
  getCurrentUser() {
    const docRef = doc(this.firestore, 'users', 'xzYmGNA9f2PSTIScvGn7');
    this.loginID = docRef.id; // gibt immer ID vom User zurück
    this.saveToLocalStorage(this.loginID);
    //return docData(docRef).pipe(map(data => data as User)); // gibt immer Daten vom Typ User zurück
  }*/

}

