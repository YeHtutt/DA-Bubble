import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent {
  forgetPasswordForm: FormGroup;
  sendEmailSuccess: boolean | null = null;
  
  constructor(private formBuilder: FormBuilder, 
    private authService: AuthenticationService,
    private router: Router,
    private afauth: AngularFireAuth,
    private _snackBar: MatSnackBar
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
    if(this.sendEmailSuccess == true) {
      this._snackBar.open('Email wurde erfolgreich gesendet', 'Undo', {
        duration: 2000
      });
    }else{
      this._snackBar.open('Emailsendung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.', 'Undo', {
        duration: 2000
      });
    }
  }

  
}
