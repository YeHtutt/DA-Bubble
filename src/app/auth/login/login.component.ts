import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { PresenceService } from 'src/app/shared/services/presence.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';


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
    }
  
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (user) => {
        if (user) {
          // Set user presence to online
          this.presence.setPresence('online');
          // Perform necessary actions after successful login
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
        // Optionally handle the error more specifically, like showing an error message
      }
    });
  }
  


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
        //console.error('Login error:', error);
        this.loginSuccess = false;
        this.authService.setIsAuthenticated(false);
        this.openSnackBar();
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
      this.notificationService.showError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben!')
    }
  }
}
