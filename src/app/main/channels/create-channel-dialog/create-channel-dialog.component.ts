import { Component } from '@angular/core';
import { ChannelService } from 'src/app/services/channel.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserProfile } from 'src/app/models/user-profile';
import { ChannelUsersDialogComponent } from '../channel-users-dialog/channel-users-dialog.component';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';


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
    private firebaseUtils: FirebaseUtilsService,
    public notificationService: NotificationService,
    private userService: UsersFirebaseService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CreateChannelDialogComponent>,
    private channelService: ChannelService
  ) { }

  ngOnInit() {
    this.channelService.getAllChannels();

  }

  addChannel() {

    if (this.channelNameInput.invalid) {
      this.notificationService.checkInputLength(this.channelNameInput);
      this.validateInput()
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
      creationTime: this.firebaseUtils.getDateTime(),
      creator: creator,
      usersData: [],

    };
    this.openAddUserlDialog();
  }


  openAddUserlDialog() {
    this.dialog.open(ChannelUsersDialogComponent, {
      width: '710px',
      height: 'auto',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      autoFocus: false,
      data: { channel: this.channel }
    });
  }

  closeCreateChannelDialog() {
    this.dialogRef.close();
  }


  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }

  getErrorMessage() {
    if (this.channelNameInput.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.checkForDoubledChannels()) {
      return 'The channel already exists';
    }
    // Remove the 'email' validation as it doesn't seem relevant for a channel name
    return '';
  }
  


  validateInput() {
    this.notificationService.checkInputLength(this.channelNameInput);
    if (this.checkForDoubledChannels()) {
      console.log('double detected')
    }
  }


    checkForDoubledChannels() {
      // Assuming this.channelService.channels is an array of channel objects
      const channelName = this.channelNameInput.value // Consider case-insensitivity
      return this.channelService.channels.some(checkChannel => checkChannel.channelName === channelName);
    }
    

   }

