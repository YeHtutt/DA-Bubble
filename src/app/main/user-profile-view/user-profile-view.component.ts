import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UserProfileEditComponent } from '../user-profile-edit/user-profile-edit.component';

@Component({
  selector: 'app-user-profile-view',
  templateUrl: './user-profile-view.component.html',
  styleUrls: ['./user-profile-view.component.scss']
})
export class UserProfileViewComponent implements OnInit {

  ngOnInit() {
    this.userFbService.getLoggedInUser(this.userFbService.getFromLocalStorage());
  }

  constructor(public dialog: MatDialog, public userFbService: UsersFirebaseService) {

  }

  onNoClick(){
    
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  openProfileEditDialog(): void {
    const dialogRef = this.dialog.open(UserProfileEditComponent, {
      width: '500px',
      height: '705px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed');
    });
  }
}
