import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { NotificationService } from 'src/app/shared/services/notification.service';


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

    this.oobCode = this.authService.oobCode;
  }

  
  onSubmit() {
    const password = this.resetPasswordForm.value.password;
    this.authService.confirmResetPassword(this.oobCode, password)
      .then(() => {
        this.resetPasswordSuccess = true;
        this.openSnackBar();
        this.notificationService.showSuccess('password changed successfully!');
      })
      .catch(error => {
        this.notificationService.showError('password change failed');
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