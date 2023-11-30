import { Injectable } from '@angular/core';
import { Auth, authState, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { serverTimestamp } from 'firebase/database';
import { Observable, firstValueFrom, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  constructor(private afAuth: Auth, private db: AngularFireDatabase) {
    this.updateOnUser().subscribe();
    this.updateOnDisconnect().subscribe();
    this.updateOnAway();
  }

  
  getPresence(uid: string) {
    return this.db.object(`status/${uid}`).valueChanges();
  }


  async getUser() {
    return await firstValueFrom(authState(this.afAuth));
  }


  async setPresence(status: string) {
    const user = await this.getUser();
    if (user) {
      return this.db.object(`status/${user.uid}`).update({ status, timestamp: this.timestamp });
    }
  }


  get timestamp() {
    return serverTimestamp();
  }


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