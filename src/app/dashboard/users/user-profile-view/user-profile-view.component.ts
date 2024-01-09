import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';
import { UserProfileEditComponent } from '../user-profile-edit/user-profile-edit.component';
import { PresenceService } from 'src/app/shared/services/presence.service';
import { Observable } from 'rxjs';
import { UserProfile } from 'src/app/models/user-profile';

@Component({
  selector: 'app-user-profile-view',
  templateUrl: './user-profile-view.component.html',
  styleUrls: ['./user-profile-view.component.scss']
})
export class UserProfileViewComponent implements OnInit {

  presence$: Observable<any> = new Observable();
  currentUser: UserProfile = new UserProfile();

  constructor(
    public dialog: MatDialog,
    public userFbService: UsersFirebaseService,
    public drawerService: DrawerService,
    private presenceService: PresenceService
  ) {}

  async ngOnInit() {
    this.currentUser = await this.userFbService.getUser(this.userFbService.getFromLocalStorage());
    this.presence$ = this.presenceService.getPresence(this.currentUser.id);
  }


  closeDialog() {
    this.dialog.closeAll();
  }

  openProfileEditDialog(): void {
    const dialogRef = this.dialog.open(UserProfileEditComponent, {
      width: '500px',
      height: 'auto',
      hasBackdrop: true,
      panelClass: 'user-profile-view-dialog',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed');
    });
  }
}
