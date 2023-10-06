import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormBuilder } from '@angular/forms';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { Auth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  userID: any;
  loginSuccess: boolean | null = null;

  ngOnInit() {
    this.loginSuccess = false;
  }

  constructor(private authService: AuthenticationService,
    private router: Router,
    private formBuilder: FormBuilder,
    private usersFbService: UsersFirebaseService,
    private _snackBar: MatSnackBar,
    ) {
  }

  loginForm = new FormGroup({
    "email": new FormControl('', [Validators.required, Validators.email]),
    "password": new FormControl('', [Validators.required, Validators.minLength(6)]),
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
          this.usersFbService.getLoggedInUser(user.uid);
          this.usersFbService.saveToLocalStorage(user.uid);
          this.loginSuccess = true;
          this.openSnackBar();
          this.router.navigate([`/main`]);
        } else {
          this.loginSuccess = false;
          this.openSnackBar();
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
        this.usersFbService.getLoggedInUser(user.uid);
        this.usersFbService.saveToLocalStorage(user.uid);
        this.loginSuccess = true;
        this.openSnackBar();
        this.router.navigate([`/main`]);
      } else {
        this.loginSuccess = false;
        this.openSnackBar();
        console.error('user is null.');
      }
    })
  }
  
  
  loginWithGoogle() {
    this.authService.signinWithGoogle();
  }

  openSnackBar() {
    if(this.loginSuccess == true) {
      this._snackBar.open('Login erfolgreich', 'Undo', {
        duration: 2000
      });
    }else{
      this._snackBar.open('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.', 'Undo', {
        duration: 2000
      });
    }
  }
}
