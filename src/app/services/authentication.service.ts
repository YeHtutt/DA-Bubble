import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile, getAuth, updateEmail } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { from, switchMap } from 'rxjs';
import { UserProfile } from '../models/user-profile';
import { NotificationService } from './notification.service';
import { UsersFirebaseService } from './users-firebase.service';




@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public userUID: any;
  public currentUser: any;
  user: UserProfile;
  private isAuthenticated = false;
  oobCode: string = '';



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
    this.userfbService.updateUserOnlineStatus(this.userfbService.getFromLocalStorage(), false);
    return from(this.auth.signOut().then(() => {
      this.userfbService.removeFromLocalStorage();
    }));
  }


  signUp(name: string, email: string, password: string, newUser: UserProfile) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(({ user }) => {
        const uid = user.uid;
        this.SendVerificationMail();
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

  getCurrentUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user ? user.email : null;
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


  updateEmail(newEmail: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      updateEmail(user, `${newEmail}`).then(() => {
      }).catch((error) => {
        console.log('update email address error');
      });
    }

  }


  async SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        
      });
  }
}
