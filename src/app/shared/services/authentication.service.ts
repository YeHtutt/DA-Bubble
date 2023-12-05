import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, signInWithPopup, updateProfile, getAuth, updateEmail, sendEmailVerification } from '@angular/fire/auth';
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
    let channel = (await this.channelService.getSingleChannel('W1y1PNesrIl7kbXs1YQU')).toJSON();

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

      // Navigate to the main channel view
      this.router.navigate([`/dashboard/channel/W1y1PNesrIl7kbXs1YQU`]);
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


  updateUserEmail(newEmail: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      updateEmail(user, `${newEmail}`).then(() => {
      }).catch((error) => {
        console.log('update email address error');
      });
    }

  }


/* updateUserEmail(newEmail: any) {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      updateEmail(user, newEmail)
        .then(() => {
          // Email updated in Firebase Auth, now send a verification email
          sendEmailVerification(user).then(() => {
            console.log('Verification email sent to new email address.');
          }).catch((error) => {
            console.error('Error sending email verification:', error);
          });
        })
        .catch((error) => {
          console.error('Error updating email:', error);
  
          // Example of re-authenticating the user if needed
          if (error.code === 'auth/requires-recent-login') {
            const credential = EmailAuthProvider.credential(
              user.email as string, // assert that email is not null
              'the user\'s current password'
            );
            reauthenticateWithCredential(user, credential).then(() => {
              // Try to update the email again
            }).catch((reauthError) => {
              console.error('Error re-authenticating:', reauthError);
            });
          }
        });
    } else {
      console.log('No user is currently signed in');
    }
  }
   */

  // sendVerificationEmailForNewEmail(newEmail: any) {
  //   const auth = getAuth();
  //   const user = auth.currentUser;

  //   if (user) {
  //     // Zuerst die E-Mail-Adresse des Nutzers vorübergehend aktualisieren
  //     updateEmail(user, newEmail).then(() => {
  //       // Sende eine E-Mail zur Bestätigung der neuen E-Mail-Adresse
  //       sendEmailVerification(user).then(() => {
  //         console.log('Verification email sent to ' + newEmail);
  //       }).catch((error) => {
  //         console.log('Error sending verification email:', error);
  //       });
  //     }).catch((error) => {
  //       console.log('Error updating email:', error);
  //     });
  //   } else {
  //     console.log('No user is currently signed in');
  //   }
  // }



  sendVerificationMail(user: any) {
    return sendEmailVerification(user)
      .then(() => {
        console.log('Verification email sent.');
        // Additional logic if needed, like redirecting to a 'check your email' page
      })
      .catch((error) => {
        console.error('Error sending email verification:', error);
        // Handle errors here, such as displaying a notification to the user
      });
  }



  /* Auth Guard */

}
