import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormBuilder } from '@angular/forms';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  //isIntro = true;

  constructor(private authService: AuthenticationService,
    private router: Router,
    private formBuilder: FormBuilder,
    private usersFbService: UsersFirebaseService,) {
    /*setTimeout(() => {
      this.isIntro = false;
    }, 2500);*/
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
    if (!this.loginForm.valid) {
      return;
    } else {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe(() => {
        const user = this.authService.getCurrentUser();

        if (user) {
          this.usersFbService.saveToLocalStorage(user.uid); //save Firebase Authentication ID to local Storage to find the logged user
          this.router.navigate([`/main`]);
        } else {
          console.error('user is null.');
        }
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
      const user = this.authService.getCurrentUser();
      if (user) {
        this.usersFbService.saveToLocalStorage(user.uid); //save Firebase Authentication ID to local Storage to find the logged user 
        this.router.navigate([`/main`]);
      } else {
        console.error('user is null.');
      }
    })
  }
}
