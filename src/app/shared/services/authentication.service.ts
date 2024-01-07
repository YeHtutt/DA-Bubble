import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, verifyBeforeUpdateEmail, signInWithPopup, updateProfile, getAuth, updateEmail, sendEmailVerification, UserCredential } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { from, switchMap, Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile';
import { NotificationService } from './notification.service';
import { UsersFirebaseService } from './users-firebase.service';
import { ChannelService } from './channel.service';
import { Channel } from '../../models/channel';
import { MainIdsService } from './main-ids.service';
import { tap, map } from 'rxjs/operators';

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
    private notificationService: NotificationService,
    private channelService: ChannelService,
    private idService: MainIdsService) {
    this.user = new UserProfile(); // user initialisiert
  }


  login(email: any, password: any): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password))
      .pipe(
        tap((userCredential: UserCredential) => {
          if (userCredential.user) {
            const userId = userCredential.user.uid;
            this.usersFbService.saveToLocalStorage(userId); 
            this.channelService.currentUserId = userId; 
          }
        }),
        map(userCredential => userCredential.user)
      );
  }

  logout() {    
    this.setIsAuthenticated(false);
    this.userfbService.updateUserOnlineStatus(this.userfbService.getFromLocalStorage(), false);
    this.channelService.unsubChannelTree();
    return from(this.auth.signOut().then(() => {
      this.userfbService.removeFromLocalStorage();
    }));
  }


  signUp(name: string, email: string, password: string, newUser: UserProfile) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(({ user }) => {
        const uid = user.uid;
        this.addUidToUser(newUser, uid);
        this.sendVerificationMail(user);
        this.userfbService.addUserToFirebase(newUser.toJSON(), uid);
        this.addToGeneralChannel(uid);
        return updateProfile(user, { displayName: name });
      })
    );
  }


  async addToGeneralChannel(user: string) {
    const userData = (await this.usersFbService.getUser(user)).toJSON();
    let channel = (await this.channelService.getSingleChannel(this.idService.mainChannelId)).toJSON();
    if (!channel.usersData.some((u: any) => u.id === userData.id)) {
      channel.usersData.push(userData);
      this.channelService.updateChannel(new Channel(channel));
    } else {
      console.log('User already exists in the channel');
    }
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


  /* ID */
  async signinWithGoogle() {
    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, googleProvider);

      console.log("signInWithPopup result:", result);
      if (result && result.user) {
        const collRef = doc(this.firestore, 'users', result.user.uid);
        this.userUID = result.user.uid;
        this.currentUser = result.user;
        this.user = new UserProfile({
          id: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          isOnline: true,
        });
        await setDoc(collRef, this.user.toJSON());
        await this.addToGeneralChannel(result.user.uid);
        this.usersFbService.saveToLocalStorage(result.user.uid);
        this.notificationService.showSuccess('Login erfolgreich');
      }
      this.router.navigate([`/dashboard/channel/${this.idService.mainChannelId}`]);
    } catch (error) {
      console.error(error);
      this.notificationService.showError('Login fehlgeschlagen!');
    }
  }




  // Füge eine öffentliche Methode hinzu, um isAuthenticated abzurufen
  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }


  // Füge eine öffentliche Methode hinzu, um isAuthenticated festzulegen
  setIsAuthenticated(value: boolean) {
    this.isAuthenticated = value;
  }


  updateAndVerifyEmail(newEmail: any) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      verifyBeforeUpdateEmail(user, newEmail).then(() => {
        this.notificationService.showSuccess('Eine Verifikations-Email wurde an ihre neue Adresse gesendet');
      }).catch((error) => {
        this.notificationService.showError('Die Änderung der Email war nicht erfolgreich');
      });
    } else {
      this.notificationService.showError('Es ist kein Benutzer eingeloggt');
    }
  }





  sendVerificationMail(user: any) {
    return sendEmailVerification(user)
      .then(() => {
        this.notificationService.showSuccess('Eine Verifikations-Email wurde an ihr Postfach gesendet');
      })
      .catch((error) => {
        console.error('Error sending email verification:', error);
      });
  }
}


