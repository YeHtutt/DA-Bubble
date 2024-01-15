import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent {

  forgetPasswordForm: FormGroup;
  sendEmailSuccess: boolean | null = null;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private afauth: AngularFireAuth, 
    private notificationService: NotificationService
  ) {
    this.forgetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }


  onSubmit() {
    const email = this.forgetPasswordForm.value.email;
    this.afauth.sendPasswordResetEmail(email);
    this.sendEmailSuccess = true;
    this.openSnackBar();
    this.router.navigate(['/login'])
  }


  openSnackBar() {
    if (this.sendEmailSuccess == true) {
      this.notificationService.showSuccess('Email wurde erfolgreich gesendet');
    } else {
      this.notificationService.showError('Emailsendung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
    }
  }
}