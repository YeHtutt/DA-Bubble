import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Channel } from 'src/app/models/channel';
import { AddPeopleDialogComponent } from '../add-people-dialog/add-people-dialog.component';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UserProfile } from 'src/app/models/user-profile';


@Component({
  selector: 'app-user-menu-dialog',
  templateUrl: './user-menu-dialog.component.html',
  styleUrls: ['./user-menu-dialog.component.scss']
})
export class UserMenuDialogComponent {

  allUsers: UserProfile[] = [];
  allUsersArray: any[] = [];
  channel: Channel = new Channel(this.data.channel);
  @Input() isMobile: boolean = false;
  openingInChat: boolean = this.data.openingInChat;


  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<UserMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UsersFirebaseService
  ) { }



  ngOnInit() {
    this.getAllUsers();
    console.log(this.channel.usersData)
  }


  async getAllUsers() {
    this.allUsers = await this.userService.getUsers();
    this.allUsers.forEach((user: UserProfile) => {
      let userToJSON = user.toJSON();
      this.allUsersArray.push(userToJSON);
    });

    this.updateUserOnlineStatus();
  }


  // I'm assuming 'id' is the unique identifier for each user. Replace 'id' with the appropriate key.
  updateUserOnlineStatus() {
    this.channel.usersData.forEach((channelUser: any) => {
      // Find the matching user in allUsersArray
      const matchedUser = this.allUsersArray.find(user => user.id === channelUser.id);
      if (matchedUser) {
        // Update the isOnline status
        channelUser.isOnline = matchedUser.isOnline;
      }
    });
  }



  closeCreateChannelDialog() {
    this.dialogRef.close();
  }


  addUserDialog() {
    let dialogStyle;
    if (this.openingInChat) { dialogStyle = 'corner-right-top-dialog'; }
    if (!this.openingInChat) { dialogStyle = 'top-left-right-dialog'; }
    this.dialog.open(AddPeopleDialogComponent, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
      panelClass: dialogStyle,
      autoFocus: false,
      data: {
        channel: this.channel,
        openingInChat: this.openingInChat
      }
    });

  }

}
