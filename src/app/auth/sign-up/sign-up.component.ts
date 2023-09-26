import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  checked = false;

  constructor(private authService: AuthenticationService, private router:Router, private usersFbService: UsersFirebaseService) {

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

      const user = {
        name: name,
        email: email,
      };

      this.usersFbService.addUserToFirebase(user).then((docId) => {
        //console.log('user saved successfully');
        this.router.navigate(['/main']);
      })
      .catch((error) => {
        console.error('Fehler beim Speichern des Benutzers in Firestore:', error);
      });
    })
  }
}
