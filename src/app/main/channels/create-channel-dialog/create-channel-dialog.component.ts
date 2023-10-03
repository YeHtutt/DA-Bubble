import { Component } from '@angular/core';
import { ChannelService } from 'src/app/services/channel.service';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-create-channel-dialog',
  templateUrl: './create-channel-dialog.component.html',
  styleUrls: ['./create-channel-dialog.component.scss']
})
export class CreateChannelDialogComponent {

  channelNameInput = new FormControl('', [Validators.required, Validators.minLength(3)]);
  channelDescription: string = '';

  constructor(
    private channelService: ChannelService,
    public dialogRef: MatDialogRef<CreateChannelDialogComponent>,
    public utilsService: UtilsService,
    private userService: UsersFirebaseService
  ) { }

  addChannel() {
    if (this.channelNameInput.invalid) {
      this.utilsService.checkInputLength(this.channelNameInput);
      return;
    };
    this.setChannelProperties();
  }


  setChannelProperties() {
    let channel = {
      channelName: this.channelNameInput.value,
      description: this.channelDescription,
      creationTime: this.getCurrentTimestamp(),
      creatorId: this.getCreatorId(),
      createdBy: '',
    };
    console.log(channel);
    this.channelService.addChannel(channel, 'channels');
    this.closeCreateChannelDialog();
  }


  getCurrentTimestamp() {
    return this.channelService.getDateTime();
  }

  closeCreateChannelDialog() {
    this.dialogRef.close();
  }




  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }



}
