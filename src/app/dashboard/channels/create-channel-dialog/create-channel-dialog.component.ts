import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserProfile } from 'src/app/models/user-profile';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { FirebaseUtilsService } from 'src/app/shared/services/firebase-utils.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';
import { ChannelUsersDialogComponent } from '../channel-users-dialog/channel-users-dialog.component';


/**
 * Component for creating a new channel.
 * Provides a dialog interface for users to enter channel details and add members.
 */
@Component({
  selector: 'app-create-channel-dialog',
  templateUrl: './create-channel-dialog.component.html',
  styleUrls: ['./create-channel-dialog.component.scss']
})
export class CreateChannelDialogComponent {


  channelDescription: string = '';
  channel: any;
  channelNameInput = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(12)]);


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
    this.subscribeToChannelNameChanges();
  }


  /**
  * Subscribes to changes in the channel name input field.
  */
  subscribeToChannelNameChanges() {
    this.channelNameInput.valueChanges.subscribe(() => {
      this.validateInput();
    });
  }


  /**
  * Validates and processes the addition of a new channel.
  */
  addChannel() {
    if (this.channelNameInput.invalid) {
      return;
    };
    this.setChannelProperties();
  }


  /**
  * Sets channel properties and opens the dialog to add users to the channel.
  */
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
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      autoFocus: false,
      data: { channel: this.channel }
    });
    this.closeCreateChannelDialog();
  }


  closeCreateChannelDialog() {
    this.dialogRef.close();
  }


  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }


  /**
  * Generates and returns error messages for the channel name input based on validation errors.
  * @returns {string} The error message string.
  */
  getErrorMessage() {
    if (this.channelNameInput.hasError('required')) return 'Du musst einen Namen eingeben.';
    if (this.checkForDoubledChannels()) return 'Der Channel exisiert bereits.';
    if (this.channelNameInput.hasError('minlength')) return 'Der Channelname sollte wenigstens drei Buchstaben haben';
    if (this.channelNameInput.hasError('maxlength')) return 'Der Channelname darf nicht länger als 12 Buchstaben sein';
    return '';
  }


  /**
  * Validates the input for the channel name, checking for duplicate names.
  */
  validateInput() {
    const channelName = this.channelNameInput.value;
    if (this.channelService.channels.some(checkChannel => checkChannel.channelName === channelName)) {
      this.channelNameInput.setErrors({ duplicated: true });
    } else {
      if (this.channelNameInput.hasError('duplicated')) {
        this.channelNameInput.setErrors(null);
      }
    }
  }


  /**
   * Checks for duplicate channel names.
   * @returns {boolean} True if a duplicate name is found, false otherwise.
   */
  checkForDoubledChannels() {
    // Assuming this.channelService.channels is an array of channel objects
    const channelName = this.channelNameInput.value // Consider case-insensitivity
    return this.channelService.channels.some(checkChannel => checkChannel.channelName === channelName);
  }


}
