import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-verified-success',
  templateUrl: './verified-success.component.html',
  styleUrls: ['./verified-success.component.scss']
})
export class VerifiedSuccessComponent {

  oobCode: string = '';

  constructor(private afAuth: AngularFireAuth, private authService: AuthenticationService, private router: Router) {
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
    }, 4000);
  }
}