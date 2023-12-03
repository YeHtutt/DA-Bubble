import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-distributor',
  templateUrl: './distributor.component.html',
  styleUrls: ['./distributor.component.scss']
})
export class DistributorComponent {

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthenticationService) {
    this.route.queryParams.subscribe(params => {
      const mode = params['mode'];
      const oobCode = params['oobCode'];
      this.saveCodeInService(oobCode);
      this.routeToFinalDestination(mode)
    })
  }


  saveCodeInService(oobCode: string) {
    this.authService.oobCode = oobCode;
  }


  routeToFinalDestination(mode: string) {
    if (mode === 'verifyEmail') {
      this.router.navigate(['/verification-success']);
    } else {
      this.router.navigate(['/reset-password']);
    }
  }
}
