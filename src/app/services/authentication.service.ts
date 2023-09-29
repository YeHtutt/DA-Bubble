import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, User } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private auth: Auth) { }

  login(email: any, password: any) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logout(){
    return from(this.auth.signOut());
  }

  signUp(name: string, email: string, password: string) {
    this.auth.currentUser;
    console.log("current user Id: ", this.auth.currentUser?.uid);
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap( ({ user }) => 
        updateProfile(user, {displayName: name})
       )
    );
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
  

}
