
import { Injectable, inject } from '@angular/core';

import {
  Firestore, collection,
  doc, onSnapshot,
  addDoc, getDoc, updateDoc,
  deleteDoc, orderBy,
  where, query,
  limit,
  collectionData,
  getDocs
} from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirebaseUtilsService {

  constructor() { }
  firestore: Firestore = inject(Firestore);




  async addColl(item: {}, ref: string, fieldId: string) {
    try {
      const docRef = await addDoc(this.getRef(ref), item);
      console.log("Document written with ID", docRef.id);
      // Update the document with the ID
      await updateDoc(docRef, { [fieldId]: docRef.id });
    } catch (err) {
      console.log(err);
    }
  }




  async updateDoc(path: string, docId: string, obj: any) {
    let docRef = this.getSingleDocRef(path, docId);
    await updateDoc(docRef, obj.toJSON())
      .catch((err) => { console.log(err) })
      .then(() => { })
  }




  /* This method takes a collection ID and a document ID as parameters and returns a reference to the specified document in the Firestore database. */
  getRef(ref: any) {
    return collection(this.firestore, ref);
  }


  /**
   * @param path path to the collection or sub-collection
   * @param docId id of the document
   * @returns a reference to the doc
   */

  getSingleDocRef(path: string, docId: string) {
    return doc(collection(this.firestore, path), docId)
  }


  async getDocData(col: string, docId: string) {
    let docRef = this.getSingleDocRef(col, docId);
    // Fetch the actual document data using the getDoc method
    const docSnapshot = await getDoc(docRef);
    // Check if the document exists and print its data
    if (docSnapshot.exists()) {
      return docSnapshot.data();
    } else {
      return console.log("No such document!");
    }
  }

  


  getDateTime() {
    let dateTime = new Date();
    return dateTime
  }


  async deleteCollection(colId: string, docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId))
      .catch((err) => { console.log(err) })
  }


  async chatExists(user1: string, user2: string): Promise<boolean> {
    const chatCollection = collection(this.firestore, 'chat');

    // Query for user1 -> user2
    const query1 = query(chatCollection, where('user1', '==', user1), where('user2', '==', user2));
    const result1 = await getDocs(query1);

    // Query for user2 -> user1
    const query2 = query(chatCollection, where('user1', '==', user2), where('user2', '==', user1));
    const result2 = await getDocs(query2);

    // Return true if either query has results
    return !result1.empty || !result2.empty;
  }

  async getExistingChatId(user1: string, user2: string): Promise<string> {
    const chatCollection = collection(this.firestore, 'chat');

    // Query for user1 -> user2
    const query1 = query(chatCollection, where('user1', '==', user1), where('user2', '==', user2));
    const result1 = await getDocs(query1);

    // If found, return the chatId
    if (!result1.empty) {
      return result1.docs[0].id;
    }

    // Query for user2 -> user1
    const query2 = query(chatCollection, where('user1', '==', user2), where('user2', '==', user1));
    const result2 = await getDocs(query2);

    // If found, return the chatId
    if (!result2.empty) {
      return result2.docs[0].id;
    }

    // If not found, return an empty string (or handle as needed)
    return '';
  }

}
