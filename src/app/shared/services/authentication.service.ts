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

/**
 * Service for handling authentication-related operations in an Angular application.
 * Utilizes Firebase Authentication for managing user authentication and AngularFireAuth
 * for integrating Firebase Authentication with Angular. Also interacts with Firestore
 * for user data management and Router for navigation.
 */

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

  constructor(
    private auth: Auth,
    private afAuth: AngularFireAuth,
    private userfbService: UsersFirebaseService, private router: Router,
    private usersFbService: UsersFirebaseService,
    private notificationService: NotificationService,
    private channelService: ChannelService,
    private idService: MainIdsService) {
    this.user = new UserProfile();
  }

  /**
   * Authenticates a user using their email and password. Tap, pipe and map methods needs to implemented because of a
   * channel related bug, which causes the channels to be sorted false to close and open channels.
   * @param {any} email - User's email address.
   * @param {any} password - User's password.
   * @returns {Observable<User>} An observable emitting the authenticated user.
   */
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

  /**
   * Logs out the current user and performs necessary cleanup.
   * @returns {Promise<void>} A promise indicating the completion of the logout process.
   */
  async logout(): Promise<void> {
    this.setIsAuthenticated(false);
    await this.performLogoutCleanup();
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      // Additional error handling as needed
    }
    this.userfbService.removeFromLocalStorage();
  }


  /**
   * Performs cleanup operations necessary during logout.
   * To unsub the channel tree was necessary display the correct data when changing the current user.
   */
  async performLogoutCleanup() {
    this.userfbService.updateUserOnlineStatus(this.userfbService.getFromLocalStorage(), false);
    this.channelService.unsubChannelTree();
  }

  /**
     * Signs up a new user with their name, email, and password.  
     * @param {UserProfile} newUser - New user's profile information.
     * @returns {Observable<any>} An observable with the result of the sign-up process.
  */
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


  /**
   * Adds a user to the general channel.
   * @param {string} user - User identifier.
   */
  async addToGeneralChannel(user: string) {
    const userData = (await this.usersFbService.getUser(user)).toJSON();
    let channel = (await this.channelService.getSingleChannel(this.idService.mainChannelId)).toJSON();
    if (!channel.usersData.some((u: any) => u.id === userData.id)) {
      channel.usersData.push(userData);
      this.channelService.updateChannel(new Channel(channel));
    }
  }


  /**
   * Associates a unique identifier with a new user's profile.
   * @param {UserProfile} newUser - The new user's profile.
   * @param {string} uid - The unique identifier for the user.
   * @returns {UserProfile} The updated user profile.
   */
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



  async signinWithGoogle() {
    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, googleProvider);
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


  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }


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


