import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
/*import { UserProfile } from '@angular/fire/auth';*/
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfile } from 'src/app/models/user-profile';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  checked = false;
  user: UserProfile = new UserProfile;

  constructor(private authService: AuthenticationService, private router:Router, private usersFbService: UsersFirebaseService, private auth: Auth) {

  }

  signUpForm: any = new FormGroup({
    "name" : new FormControl('', [Validators.required]),
    "email": new FormControl('', [Validators.email, Validators.required]) ,
    "password" : new FormControl('', [Validators.required]), 
    "agreement": new FormControl(false, [Validators.requiredTrue])
  })

  get name() {
    return this.signUpForm.get('name');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }


  submit() {
    if(!this.signUpForm.valid || !this.signUpForm.get('agreement').value) {
      return;
    }
    const {name, email, password} = this.signUpForm.value;
    this.authService.signUp(name, email, password)
    .subscribe(() => {

      this.user.email = email;
      this.user.name = name;
      this.user.id = this.auth.currentUser?.uid;

      this.usersFbService.saveToLocalStorage(this.auth.currentUser?.uid);

      this.usersFbService.addUserToFirebase(this.user.toJSON()).then((docId) => {
        this.router.navigate([`/main`]);
      })
      .catch((error) => {
        console.error('error of saving users in Firestore:', error);
      });
    })
  }

}
