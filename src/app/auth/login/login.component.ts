import { Component, OnInit, HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormBuilder } from '@angular/forms';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { Auth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/services/notification.service';

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
    private notificationService: NotificationService
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
          this.usersFbService.updateUserOnlineStatus(user.uid, true);
          this.loginSuccess = true;
          this.authService.setIsAuthenticated(true);
          this.openSnackBar();
          this.router.navigate([`/main`]);
        } else {
          this.loginSuccess = false;
          this.authService.setIsAuthenticated(false);
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
        this.usersFbService.updateUserOnlineStatus(user.uid, true);
        this.loginSuccess = true;
        this.authService.setIsAuthenticated(true);
        this.openSnackBar();
        this.router.navigate([`/main`]);
      } else {
        this.loginSuccess = false;
        this.authService.setIsAuthenticated(false);
        this.openSnackBar();
        console.error('user is null.');
      }
    })
  }


  loginWithGoogle() {
    this.authService.signinWithGoogle();
    this.authService.setIsAuthenticated(true);
  }

  openSnackBar() {
    if (this.loginSuccess == true) {
      this.notificationService.showSuccess('Login erfolgreich');
    } else {
      this.notificationService.showError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.')
    }
  }

  isScreenAbove750px = window.innerWidth > 750;

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.isScreenAbove750px = event.target.innerWidth > 750;
  }
}
