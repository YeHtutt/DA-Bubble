import { Component } from '@angular/core';
import { ChannelService } from 'src/app/services/channel.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UserProfile } from 'src/app/models/user-profile';
import { ChannelUsersDialogComponent } from '../channel-users-dialog/channel-users-dialog.component';

@Component({
  selector: 'app-create-channel-dialog',
  templateUrl: './create-channel-dialog.component.html',
  styleUrls: ['./create-channel-dialog.component.scss']
})
export class CreateChannelDialogComponent {

  channelNameInput = new FormControl('', [Validators.required, Validators.minLength(3)]);
  channelDescription: string = '';
  channel: any;


  constructor(
    private channelService: ChannelService,
    public utilsService: UtilsService,
    private userService: UsersFirebaseService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CreateChannelDialogComponent>,
  ) { }

  addChannel() {
    if (this.channelNameInput.invalid) {
      this.utilsService.checkInputLength(this.channelNameInput);
      return;
    };
    this.setChannelProperties();
  }


  async setChannelProperties() {
    let creatorId = this.getCreatorId();
    let creator = (await this.userService.getUser(creatorId) as UserProfile).toJSON();
    this.channel = {
      channelName: this.channelNameInput.value,
      description: this.channelDescription,
      creationTime: this.getCurrentTimestamp(),
      creator: creator,
      usersData: [],
    };
    this.openAddUserlDialog(); 
/*       this.channelService.addChannel(this.channel, 'channels');  */
  }


  openAddUserlDialog() {
    this.dialog.open(ChannelUsersDialogComponent, {
      width: '710px',
      height: 'auto',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      data: { channel: this.channel }
    });
  }

  closeCreateChannelDialog() {
    this.dialogRef.close();
  }



  getCurrentTimestamp() {
    return this.channelService.getDateTime();
  }

  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }



}
