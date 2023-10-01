import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileViewComponent } from '../user-profile-view/user-profile-view.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() image: any;

  constructor(private authService: AuthenticationService, private router: Router, public dialog: MatDialog,) {

  }

  userLoggedout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openUserProfile() {
    this.dialog.open(UserProfileViewComponent, {
      width: '500px',
      height: '705px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
    });
  }

}
