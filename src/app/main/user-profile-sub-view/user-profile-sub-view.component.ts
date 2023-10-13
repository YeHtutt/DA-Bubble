import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UserProfileEditComponent } from '../user-profile-edit/user-profile-edit.component';

@Component({
  selector: 'app-user-profile-sub-view',
  templateUrl: './user-profile-sub-view.component.html',
  styleUrls: ['./user-profile-sub-view.component.scss']
})
export class UserProfileSubViewComponent {
  userPhotoURL: string;
  userName: string;
  userEmail: string;


  ngOnInit() {
    this.userFbService.getLoggedInUser(this.userFbService.getFromLocalStorage());
  }

  constructor(public dialog: MatDialog, public userFbService: UsersFirebaseService,
    public dialogRef: MatDialogRef<UserProfileSubViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.userPhotoURL = data.photoURL;
    this.userName = data.name;
    this.userEmail = data.email;
  }

  onNoClick() {

  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
