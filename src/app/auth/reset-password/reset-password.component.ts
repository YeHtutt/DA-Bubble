import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  oobCode: string = '';
  /*
  resetPasswordForm: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  })*/

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });

    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'];
    })
  }

  onSubmit() {
    const password = this.resetPasswordForm.value.password;
    this.authService.confirmResetPassword(this.oobCode, password)
    .then(() => {
      console.log('password changed successfully!');
    })
    .catch(error => {
      console.log('password change failed: ', error);
    });
    this.router.navigate(['/login'])
  }

}
