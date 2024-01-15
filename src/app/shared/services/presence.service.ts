import { Injectable } from '@angular/core';
import { Auth, authState, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { serverTimestamp } from 'firebase/database';
import { Observable, firstValueFrom, map, of, tap } from 'rxjs';


/**
 * Service for handling user presence status in an Angular application.
 * This service integrates with Firebase Authentication and Firebase Realtime Database
 * to manage and update user's online, offline, and away status.
 */
@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  constructor(private afAuth: Auth, private db: AngularFireDatabase) {
    this.updateOnUser().subscribe();
    this.updateOnDisconnect().subscribe();
    this.updateOnAway();
  }


  /**
   * Retrieves the presence status of a user.
   * @param {string} uid - The user's unique identifier.
   * @returns {Observable<any>} An observable streaming the user's presence status.
   */
  getPresence(uid: string) {
    return this.db.object(`status/${uid}`).valueChanges();
  }


  /**
   * Fetches the current authenticated user.
   * @returns {Promise<any>} A promise containing the authenticated user data.
   */
  async getUser() {
    return await firstValueFrom(authState(this.afAuth));
  }


  /**
   * Sets the presence status of the current user.
   * @param {string} status - The presence status to set (e.g., 'online', 'offline', 'away').
   * @returns {Promise<void>} A promise indicating the completion of the operation.
   */
  async setPresence(status: string) {
    const user = await this.getUser();
    if (user) {
      return this.db.object(`status/${user.uid}`).update({ status, timestamp: this.timestamp });
    }
  }


  /**
   * Gets the server timestamp from Firebase.
   * @returns {any} Firebase server timestamp.
   */
  get timestamp() {
    return serverTimestamp();
  }


  /**
   * Updates the user's presence status based on their authentication state and connection status.
   * @returns {Observable<any>} An observable that emits the user's presence status.
   */
  updateOnUser() {
    const connection = this.db.object('.info/connected').valueChanges().pipe(
      map(connected => connected ? 'online' : 'offline')
    );

    return new Observable(subscriber => {
      onAuthStateChanged(this.afAuth, user => {
        if (user) {
          connection.pipe(tap(status => this.setPresence(status))).subscribe(subscriber);
        } else {
          of('offline').subscribe(subscriber);
        }
      });
    });
  }


  /**
   * Updates the user's presence status to 'away' when the user's browser tab is not visible.
   */
  updateOnAway() {
    document.onvisibilitychange = (e) => {
      if (document.visibilityState === 'hidden') {
        this.setPresence('away');
      } else {
        this.setPresence('online');
      }
    };
  }


  async signOut() {
    await this.setPresence('offline');
    await signOut(this.afAuth);
  }


  /**
   * Updates the user's presence status to 'offline' when they disconnect from Firebase.
   * @returns {Observable<any>} An observable that emits when the user's status is set to 'offline' on disconnect.
   */
  updateOnDisconnect() {
    return new Observable(subscriber => {
      onAuthStateChanged(this.afAuth, user => {
        if (user) {
          const statusRef = this.db.object(`status/${user.uid}`).query.ref;
          statusRef.onDisconnect().update({
            status: 'offline',
            timestamp: this.timestamp
          }).then(() => subscriber.next());
        }
      });
    });
  }
}