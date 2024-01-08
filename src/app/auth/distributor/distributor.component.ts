import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';


/**
* DistributorComponent acts as an intermediate component to handle and distribute
* routing based on specific query parameters received in the URL.
* It is primarily used for email verification and password reset functionalities.
*/
@Component({
  selector: 'app-distributor',
  templateUrl: './distributor.component.html',
  styleUrls: ['./distributor.component.scss']
})
export class DistributorComponent {


  // Subscribes to route query parameters and handles redirection
  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthenticationService) {
    this.route.queryParams.subscribe(params => {
      const mode = params['mode'];
      const oobCode = params['oobCode'];
      this.saveCodeInService(oobCode);
      this.routeToFinalDestination(mode)
    })
  }


  /**
  * Saves the out-of-band code received from the URL query parameters to the AuthService.
  * @param {string} oobCode - The out-of-band code for email verification or password reset.
  */
  saveCodeInService(oobCode: string) {
    this.authService.oobCode = oobCode;
  }


  /**
   * Routes to the appropriate component based on the mode received from the URL query parameters.
   * @param {string} mode - The mode determining the type of operation (e.g., email verification, password reset).
   */
  routeToFinalDestination(mode: string) {
    if (mode === 'verifyEmail' || mode === 'verifyAndChangeEmail') {
      this.router.navigate(['/verification-success']);
    } else {
      this.router.navigate(['/reset-password']);
    }
  }
}
