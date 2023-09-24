import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isIntro = true;

  constructor(private authService : AuthenticationService, private router: Router, private formBuilder: FormBuilder) {
    setTimeout(() => {
      this.isIntro = false;
    }, 2500);
  }

  loginForm = new FormGroup({
    "email": new FormControl('', [Validators.required, Validators.email]),
    "password": new FormControl('', [Validators.required]),
  })


  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  submit() {
    if(!this.loginForm.valid) {
      return;
    } else {
      const { email, password } = this.loginForm.value;
      this.authService.login( email, password).subscribe(() => {
        console.log(this.loginForm);
        this.router.navigate(['/main']);
      })
    }
  }

  fillGuestForm() {
    const guestEmail = 'guest@user.com';
    const guestPassword = '123456';

    this.loginForm = this.formBuilder.group({
      email: [guestEmail],
      password: [guestPassword]
    })
  }


  loginAsGuest() {
    this.fillGuestForm();

    this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe(() => {
      this.router.navigate(['/main']);
    })
  }
}
