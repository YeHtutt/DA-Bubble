import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, updateProfile, User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from, switchMap } from 'rxjs';
import { UsersFirebaseService } from './users-firebase.service';
import { UserProfile } from '../models/user-profile';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';




@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public userUID: any;
  public currentUser: any;
  user: UserProfile;
  private isAuthenticated = false;

   

  firestore: Firestore = inject(Firestore);

  constructor(private auth: Auth, private afAuth: AngularFireAuth, 
    private userfbService: UsersFirebaseService, private router: Router, 
    private usersFbService: UsersFirebaseService,
    private notificationService: NotificationService) {
    this.user = new UserProfile(); // user initialisiert
  }

  login(email: any, password: any) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logout() {
    this.setIsAuthenticated(false);
    this.userfbService.updateUserOnlineStatus(this.userfbService.getFromLocalStorage() , false);
    return from(this.auth.signOut().then(() => {
      this.userfbService.removeFromLocalStorage();
    }));
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



  signinWithGoogle() {
    const googleProvider = new GoogleAuthProvider();
    signInWithPopup(this.auth, googleProvider)
      .then((result: any) => {
        console.log("signInWithRedirect reuslt:", result);
        if (result && result.user) {
          const collRef = doc(this.firestore, 'users', result.user.uid);
          this.userUID = result.user.uid;
          this.currentUser = result.user;
          this.user = new UserProfile({
            id: result.user.uid,
            name: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            isOnline: false,
          })
          setDoc(collRef, this.user.toJSON());
        }
        this.usersFbService.saveToLocalStorage(result.user.uid);
        this.router.navigate([`/main`]);
        this.notificationService.showSuccess('Login erfolgreich');
      }
      ).catch((error) => {
        //console.error(error);
        this.notificationService.showError('Login fehlgeschlagen!');
      });
  }


  // Füge eine öffentliche Methode hinzu, um isAuthenticated abzurufen
  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

   // Füge eine öffentliche Methode hinzu, um isAuthenticated festzulegen
   setIsAuthenticated(value: boolean) {
    this.isAuthenticated = value;
  }

  async updateEmail(newEmail: string): Promise<void> {
    return this.afAuth.currentUser.then(user => {
      return user?.updateEmail(newEmail);
    });
  }

}
