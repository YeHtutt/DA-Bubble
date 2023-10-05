import { Injectable, Input } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, setDoc, doc, onSnapshot, getDoc } from '@angular/fire/firestore';
import { UserProfile } from '../models/user-profile';
import { Auth } from '@angular/fire/auth';
import { docData } from 'rxfire/firestore';
import { Observable, map } from 'rxjs';


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

  @Input() loggedInUserID: any;
  @Input() loggedInUserImg: any;
  @Input() loggedInUserName: any;
  @Input() loggedInUserEmail: any;


  constructor(private firestore: Firestore, private auth: Auth) { }

  async addUserToFirebase(user: any, uid: string) {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await setDoc(userRef, user);
      this.id = uid;
    } catch (error) {
      throw error;
    }
  }


  saveToLocalStorage(idValue: any) {
    localStorage.setItem('currentUser', idValue);
  }

  removeFromLocalStorage() {
    localStorage.removeItem('currentUser');
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

  async getUser(uid: any) {
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
    return !snapshot.empty;
  }


  async saveUserPic(image: string, avatarPic:boolean) {
    this.user.photoURL = image;
    const docRef = doc(this.firestore, 'users', `${this.id}`);
    if(avatarPic){
      await updateDoc(docRef, {
        photoURL: '../assets/img/avatar/' + image
      }
      );
    }else {
      await updateDoc(docRef, {
        photoURL: image
      })
    }
    
  }


  async getLoggedInUser(currentUserID: any) {
    const docRef = doc(this.firestore, 'users', currentUserID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data(); // Daten aus dem Snapshot abrufen
      this.loggedInUserID = docSnap.id;
      this.loggedInUserImg = userData['photoURL'];
      this.loggedInUserName = userData['name'];
      this.loggedInUserEmail = userData['email'];
    } else {
      console.log("No such document!");
    }
  }



}

