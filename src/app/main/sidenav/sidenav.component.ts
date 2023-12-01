import { Component, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileSubViewComponent } from '../users/user-profile-sub-view/user-profile-sub-view.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { DrawerService } from 'src/app/services/drawer.service';
import { ThreadService } from 'src/app/services/thread.service';




@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  isMobile: boolean = false;


  constructor(

    public dialog: MatDialog,
    public authService: AuthenticationService,
    public afAuth: AngularFireAuth,

    private threadService: ThreadService

  ) {}

  ngOnInit() {
    this.checkScreenSize();

  }


  ngOnDestroy() {
    
  }


  checkScreenSize() {
    if(window.innerWidth < 750) this.isMobile = true;
    if(window.innerWidth > 750) this.isMobile = false;
  }


}
