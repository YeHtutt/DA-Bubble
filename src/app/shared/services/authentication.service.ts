import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, verifyBeforeUpdateEmail, signInWithPopup, updateProfile, getAuth, updateEmail, sendEmailVerification } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { from, switchMap } from 'rxjs';
import { UserProfile } from '../../models/user-profile';
import { NotificationService } from './notification.service';
import { UsersFirebaseService } from './users-firebase.service';
import { ChannelService } from './channel.service';
import { Channel } from '../../models/channel';



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
    private channelService: ChannelService) {
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
        // Update UID in the newUser object
        const uid = user.uid;
        this.addUidToUser(newUser, uid);

        // Send a verification email to the user
        this.sendVerificationMail(user);

        // Add user details to Firestore
        this.userfbService.addUserToFirebase(newUser.toJSON(), uid);

        // Additional custom tasks (like adding user to a general channel)
        this.addToGeneralChannel(uid);

        // Update user profile with display name
        return updateProfile(user, { displayName: name });
      })
    );
  }

  /* ID */
  async addToGeneralChannel(user: string) {
    // Retrieve user data
    const userData = (await this.usersFbService.getUser(user)).toJSON();

    // Retrieve the channel data
    let channel = (await this.channelService.getSingleChannel('CQyOoOXPaiHnt18E3IQp')).toJSON();

    // Check if the user already exists in the channel
    if (!channel.usersData.some((u: any) => u.id === userData.id)) {
      // If the user doesn't exist, add them to the channel
      channel.usersData.push(userData);

      // Update the channel with the new user list
      this.channelService.updateChannel(new Channel(channel));
    } else {
      // If the user already exists in the channel, you might want to do something else
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

        // Check and add the user to the general channel
        await this.addToGeneralChannel(result.user.uid);

        this.usersFbService.saveToLocalStorage(result.user.uid);
        this.notificationService.showSuccess('Login erfolgreich');
      }

      // Navigate to the main channel view ID
      this.router.navigate([`/dashboard/channel/CQyOoOXPaiHnt18E3IQp`]);
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
        // Additional logic if needed, like redirecting to a 'check your email' page
      })
      .catch((error) => {
        console.error('Error sending email verification:', error);
        // Handle errors here, such as displaying a notification to the user
      });
  }




}
