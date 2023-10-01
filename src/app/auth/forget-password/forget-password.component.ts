import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent {
  forgetPasswordForm: FormGroup;
  /*
  forgetPasswordForm: FormGroup = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
  })*/

  constructor(private formBuilder: FormBuilder, 
    private authService: AuthenticationService,
    private router: Router,
    private afauth: AngularFireAuth) {
      this.forgetPasswordForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]]
      });
  }

  onSubmit() {
    const email = this.forgetPasswordForm.value.email;
    this.afauth.sendPasswordResetEmail(email);
    this.router.navigate(['/login'])
  }

  
}
