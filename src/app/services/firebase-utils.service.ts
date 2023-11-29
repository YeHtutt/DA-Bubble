
import { Injectable, inject } from '@angular/core';
import { UsersFirebaseService } from './users-firebase.service';

import {
  Firestore, collection,
  doc, onSnapshot,
  addDoc, getDoc, updateDoc,
  deleteDoc, orderBy,
  where, query,
  limit,
  collectionData,
  getDocs, setDoc
} from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirebaseUtilsService {
  currentUserId: any;

  constructor(private userService: UsersFirebaseService) { this.currentUserId = this.userService.getFromLocalStorage(); }
  firestore: Firestore = inject(Firestore);



/**
 * Adds an item to a Firestore collection and updates the added item with its own ID.
 * The function uses a path to identify the collection and logs errors using console.error.
 * Errors are thrown to be handled by the caller.
 * 
 * @async
 * @param {Object} item - The item to be added to the Firestore collection.
 * @param {string} path - The path to the collection in Firestore.
 * @param {string} fieldId - The name of the field where the document ID should be stored.
 * 
 * @throws {Error} If there is an error in the process.
 */
  async addDocumentWithID(item: {}, path: string, fieldId: string) {
    try {
      // Add the document to the specified collection
      const docRef = await addDoc(this.getColl(path), item);
      //console.log("Document written with ID:", docRef.id);
      // Update the document with the ID
      await updateDoc(docRef, { [fieldId]: docRef.id });
    } catch (err) {
      //console.error("Error adding document:", err);
      throw err; // Rethrow to allow caller to handle the error
    }
  }


  async addColl(item: {}, ref: string, fieldId: string) {
    try {
      const docRef = await addDoc(this.getColl(ref), item);
      //console.log("Document written with ID", docRef.id);
      // Update the document with the ID
      await updateDoc(docRef, { [fieldId]: docRef.id });
    } catch (err) {
      //console.log(err);
    }
  }

  async addCollWithCustomId(data: any, collectionName: string, customId: string): Promise<void> {
    const collectionRef = collection(this.firestore, collectionName);
    // Use the custom ID to create the document reference
    const documentRef = doc(collectionRef, customId);
    // Now use setDoc to create the document with the custom ID
    return setDoc(documentRef, data);
  }


  /**
   * Adds an item to a Firestore collection and then updates the added item with its ID.
   * 
   * @async
   * @param {string} path - The path to the collection in Firestore.
   * @param {string} fieldId - The name of the field where the document ID should be stored.
   * @param {Object} item - The item to be added to the Firestore collection.
   * 
   * @throws {Error} If there is an error in the process.
   */
  async addCollWithPath(path: string, fieldId: string, item: {}) {
    try {
      // Add the document to the specified collection
      const docRef = await addDoc(this.getColl(path), item);
      //console.log("Document written with ID", docRef.id);
      // Update the document with the ID
      await updateDoc(docRef, { [fieldId]: docRef.id });
    } catch (err) {
      //console.error(err);
      throw err;
    }
  }

  /* This method takes a collection ID and a document ID as parameters and returns a reference to the specified document in the Firestore database. */
  getColl(coll: any) {
    return collection(this.firestore, coll);
  }


  getDoc(path: string) {
    return doc(this.firestore, `${path}`);
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


  async deleteCollection(path: string, docId: string) {
    await deleteDoc(this.getSingleDocRef(path, docId))
      .catch((err) => { console.log(err) })
  }

  



}
