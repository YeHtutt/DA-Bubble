import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { PresenceService } from 'src/app/shared/services/presence.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';


/**
 * LoginComponent handles user login operations.
 * It allows users to log in using email and password, as a guest, or via Google authentication.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userID: any;
  loginSuccess: boolean | null = null;
  @Input() isStarting: boolean = false;

  ngOnInit() {
    this.loginSuccess = false;
  }

  constructor(private authService: AuthenticationService,
    private router: Router,
    private formBuilder: FormBuilder,
    private usersFbService: UsersFirebaseService,
    private notificationService: NotificationService,
    private presence: PresenceService,
    public drawerService: DrawerService
  ) {
  }


  /**
   * Form controls for email and password with validator
   */
  loginForm = new FormGroup({
    "email": new FormControl('', [Validators.required, Validators.email]),
    "password": new FormControl('', [Validators.required, Validators.minLength(6)]),
  })


  /**
   * Getter for the 'email' form control.
   * @returns FormControl for email.
   */
  get email() {
    return this.loginForm.get('email');
  }


  /**
   * Getter for the 'password' form control.
   * @returns FormControl for password.
   */
  get password() {
    return this.loginForm.get('password');
  }


  /**
  * Submits the login form and processes user authentication.
  * Sets user presence, updates online status, and navigates to the dashboard on successful login.
  * Due to issues with the channels sorting the needed a subscription to login the user correctly.
  */
  submit() {
    if (!this.loginForm.valid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (user) => {
        if (user) {
          this.presence.setPresence('online');
          this.usersFbService.getLoggedInUser(user.uid);
          this.usersFbService.saveToLocalStorage(user.uid);
          this.usersFbService.updateUserOnlineStatus(user.uid, true);
          this.loginSuccess = true;
          this.authService.setIsAuthenticated(true);
          this.openSnackBar();
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loginSuccess = false;
        this.authService.setIsAuthenticated(false);
        this.openSnackBar();
      }
    });
  }


  /**
  * Fills the login form with credentials for a guest user.
  */
  fillGuestForm() {
    const guestEmail = 'guest@user.com';
    const guestPassword = '1qay2wsx';
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

      }
    },
      (error) => {
        this.loginSuccess = false;
        this.authService.setIsAuthenticated(false);
        this.openSnackBar();
      })
  }


  loginWithGoogle() {
    this.authService.signinWithGoogle();
    this.authService.setIsAuthenticated(true);
  }


  /**
  * Displays a notification based on the result of the login attempt.
  */
  openSnackBar() {
    if (this.loginSuccess == true) {
      this.notificationService.showSuccess('Login erfolgreich');
    } else {
      this.notificationService.showError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben!')
    }
  }
}
