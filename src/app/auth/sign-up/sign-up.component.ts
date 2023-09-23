import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  checked = false;

  signUpForm = new FormGroup({
    "name" : new FormControl('', [Validators.required]),
    "email": new FormControl('', [Validators.email, Validators.required]) ,
    "password" : new FormControl('', [Validators.required]), 
    "confirmPassword" : new FormControl('', [Validators.required]),
  })

  submit() {

  }
  

}
