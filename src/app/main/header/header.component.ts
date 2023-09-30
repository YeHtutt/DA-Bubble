import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() image: any;

  constructor(private authService: AuthenticationService, private router: Router) {

  }

  userLoggedout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
