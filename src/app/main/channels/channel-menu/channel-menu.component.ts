import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ChannelService } from 'src/app/services/channel.service';
import { FormControl, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Channel } from 'src/app/models/channel';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';

@Component({
  selector: 'app-channel-menu',
  templateUrl: './channel-menu.component.html',
  styleUrls: ['./channel-menu.component.scss']
})
export class ChannelMenuComponent {



  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UsersFirebaseService,
    private channelService: ChannelService,
    public dialogRef: MatDialogRef<ChannelMenuComponent>,
    public notificationService: NotificationService,
    private firestoreUtils: FirebaseUtilsService,
  ) { }

  channel: Channel = new Channel(this.data.channel);
  currentUserId: string | null = '';
  isEditing = false;
  channelNameInput = new FormControl(this.channel.channelName);
  channelDescriptionInput = new FormControl(this.channel.description);
  editChannelName: boolean = false;
  editDescription: boolean = false;


  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  ngOnInit() {
    this.currentUserId = this.userService.getFromLocalStorage()
  }

  isOutlineVisible = true;

  toggleOutline() {
    this.isOutlineVisible = !this.isOutlineVisible;
  }

  closeCreateChannelDialog() {
    this.dialogRef.close();

  }

  leaveChannel() {
    if (this.channel.channelName !== 'allgemein') {

    }
    if (this.channel.creator.id === this.currentUserId) {

    }

  }

  toggleDescriptionInput() {
    this.editChannelName = !this.editChannelName;
  }

  toggleChannelNameInput() {
    this.editDescription = !this.editDescription;
  }

  deleteChannel() {
    if (this.currentUserId == this.channel.creator.id) {
      this.firestoreUtils.deleteCollection('channel', this.channel.channelId);
    }
    this.closeCreateChannelDialog();
  }


  saveChannelName() {
    this.channel.channelName = this.channelNameInput.value || '';
    this.channelService.updateChannel(this.channel);
    this.toggleDescriptionInput();
  }

  saveDescription() {
    this.channel.description = this.channelDescriptionInput.value;
    this.channelService.updateChannel(this.channel);
    this.toggleChannelNameInput();
  }

}
