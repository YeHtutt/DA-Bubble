import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NotificationService } from 'src/app/services/notification.service';


export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return {
        passwordsDontMatch: true
      };
    }
    return null;
  }
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  oobCode: string = '';
  resetPasswordSuccess: boolean | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    }, { validators: passwordsMatchValidator() });

    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'];
    })
  }

  onSubmit() {
    const password = this.resetPasswordForm.value.password;
    this.authService.confirmResetPassword(this.oobCode, password)
      .then(() => {
        this.resetPasswordSuccess = true;
        this.openSnackBar();
        console.log('password changed successfully!');
      })
      .catch(error => {
        console.log('password change failed: ', error);
      });
    setTimeout(() => {
      this.router.navigate(['/login'])
    }, 4000);
  }


  openSnackBar() {
    if (this.resetPasswordSuccess == true) {
      this.notificationService.showSuccess('Passwort wurde erfolgreich zurückgesetzt');
    } else {
      this.notificationService.showError('Passwortzurücksetzung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
    }
  }
}