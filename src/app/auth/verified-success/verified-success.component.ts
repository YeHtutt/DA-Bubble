import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Component({
  selector: 'app-verified-success',
  templateUrl: './verified-success.component.html',
  styleUrls: ['./verified-success.component.scss']
})
export class VerifiedSuccessComponent {

  oobCode: string = '';

  constructor(private afAuth: AngularFireAuth, private authService: AuthenticationService, private router: Router, private auth: Auth) {
    this.oobCode = this.authService.oobCode;
  }

  ngOnInit() {
    this.verifyEmailAdress(this.oobCode);
  }

  verifyEmailAdress(oobCode: string) {
    if (oobCode) {
      this.afAuth.applyActionCode(oobCode)
        .then(() => {
          console.log('E-Mail verifiziert');
        })
        .catch(error => {
          console.error('Fehler bei der Verifizierung der E-Mail', error);
        });
    }
    setTimeout(() => {
      this.router.navigate(['/login'])
    }, 6000);
  }
}