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
    this.subscribeToChannelNameChanges();
  }


  subscribeToChannelNameChanges() {
    this.channelNameInput.valueChanges.subscribe(() => {
      this.validateInput();
    });
  }

  addChannel() {
    if (this.channelNameInput.invalid) {

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

  getErrorMessage() {
    if (this.channelNameInput.hasError('required')) return 'Du musst einen Namen eingeben.';
    if (this.checkForDoubledChannels()) return 'Der Channel exisiert bereits.';
    if (this.channelNameInput.hasError('minlength')) return 'Der Channel sollte wenigstens drei Buchstaben haben';
    return '';
  }


  validateInput() {
    const channelName = this.channelNameInput.value;

    // Prüfen Sie auf doppelte Channel-Namen und setzen Sie einen Fehler, falls vorhanden
    if (this.channelService.channels.some(checkChannel => checkChannel.channelName === channelName)) {
      this.channelNameInput.setErrors({ duplicated: true });
    } else {
      // Entfernen Sie benutzerdefinierte Fehler, wenn keine Duplikate gefunden werden
      // Dies stellt sicher, dass die Fehlermeldung sofort verschwindet, sobald der Name eindeutig ist
      if (this.channelNameInput.hasError('duplicated')) {
        this.channelNameInput.setErrors(null);
      }
    }
  }



  checkForDoubledChannels() {
    // Assuming this.channelService.channels is an array of channel objects
    const channelName = this.channelNameInput.value // Consider case-insensitivity
    return this.channelService.channels.some(checkChannel => checkChannel.channelName === channelName);
  }


}

