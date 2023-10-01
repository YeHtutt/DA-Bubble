import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from, switchMap } from 'rxjs';
import { UsersFirebaseService } from './users-firebase.service';
import { UserProfile } from '../models/user-profile';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private auth: Auth, private afAuth: AngularFireAuth, private userfbService: UsersFirebaseService) { }

  login(email: any, password: any) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logout() {
    return from(this.auth.signOut());
  }

  signUp(name: string, email: string, password: string, newUser: UserProfile) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(({ user }) => {
        const uid = user.uid;
        this.addUidToUser(newUser, uid);
        this.userfbService.addUserToFirebase(newUser.toJSON(), user.uid);
        return updateProfile(user, { displayName: name });
      })
    );
  }

  addUidToUser(newUser: UserProfile, uid: string) {
    newUser.id = uid;
    return newUser;
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  confirmResetPassword(oobCode: string, newPassword: string) {
    return this.afAuth.confirmPasswordReset(oobCode, newPassword);
  }
}
