import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfile } from 'src/app/models/user-profile';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  checked = false;
  user: UserProfile = new UserProfile;
  sighUpSuccess: boolean | null = null;

  constructor(private authService: AuthenticationService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}


  signUpForm: any = new FormGroup({
    "name": new FormControl('', [Validators.required, Validators.minLength(3)]),
    "email": new FormControl('', [Validators.email, Validators.required]),
    "password": new FormControl('', [Validators.required, Validators.minLength(6)]),
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
    if (!this.signUpForm.valid || !this.signUpForm.get('agreement').value) {
      return;
    }
    const { name, email, password } = this.signUpForm.value;
    this.fillUserObject(name, email);

    this.authService.signUp(name, email, password, this.user)
      .subscribe(() => {
        this.sighUpSuccess = true;
        this.openSnackBar();
        setTimeout(() => {
          this.router.navigate([`/choose-avatar`, { userName: name }]);
        }, 2000);
      },
      (error) => {
        //console.error('SignUp error:', error);
        this.sighUpSuccess = false;
        this.openSnackBar();
      }
      )
  }


  fillUserObject(name: string, email: string) {
    this.user.email = email;
    this.user.name = name;
  }


  openSnackBar() {
    if (this.sighUpSuccess == true) {
      this.notificationService.showSuccess('Registrierung erfolgreich')
    } else {
      this.notificationService.showError('Die Benutzer/Email existiert schon bereit, bitte geben Sie die neue Angaben!')
    }
  }
}