import { Component, HostListener, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Channel } from 'src/app/models/channel';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { FirebaseUtilsService } from 'src/app/shared/services/firebase-utils.service';
import { MainIdsService } from 'src/app/shared/services/main-ids.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';

@Component({
  selector: 'app-edit-channel-dialog',
  templateUrl: './edit-channel-dialog.component.html',
  styleUrls: ['./edit-channel-dialog.component.scss']
})


export class EditChannelDialogComponent {


  channel: Channel = new Channel(this.data.channel);
  currentUserId: string | null = '';
  channelNameInput = new FormControl(this.channel.channelName);
  channelDescriptionInput = new FormControl(this.channel.description);
  isEditing: boolean = false;
  editChannelName: boolean = false;
  editDescription: boolean = false;
  isOutlineVisible: boolean = true;
  isMobile: boolean = false;
  openingInChat: boolean = this.data.openingInChat;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UsersFirebaseService,
    private channelService: ChannelService,
    public dialogRef: MatDialogRef<EditChannelDialogComponent>,
    public notificationService: NotificationService,
    private firestoreUtils: FirebaseUtilsService,
    private router: Router,
    private idsService: MainIdsService
  ) { }


  ngOnInit() {
    this.currentUserId = this.userService.getFromLocalStorage()
    this.checkMobileMode(window.innerWidth);
  }


  toggleEdit() {
    this.isEditing = !this.isEditing;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkMobileMode(event.target.innerWidth);
  }


  private checkMobileMode(width: number): void {
    this.isMobile = width <= 750;
    //console.log(this.isMobile);
  }


  toggleOutline() {
    this.isOutlineVisible = !this.isOutlineVisible;
  }


  closeCreateChannelDialog() {
    this.dialogRef.close();
  }


  leaveChannel() {
    if (this.channel.channelName === 'allgemein') {
      this.notificationService.showError('Der allgemeine Channel kann nicht verlassen werden.')
    }
    else this.leaveTheChannel();
  }


  async leaveTheChannel() {
    try {
      if (this.channel && this.currentUserId && this.channel.usersData) {
        const userIndex = this.channel.usersData.findIndex((user: any) => this.currentUserId === user.id);
        if (userIndex > -1) {
          this.channel.usersData.splice(userIndex, 1);
          await this.channelService.updateChannel(this.channel);
          this.notificationService.showSuccess('Sie haben den Channel verlassen.');
        } else {
          this.notificationService.showError('Sie sind nicht Teil dieses Channels.');
        }
      }
    } catch (error) {
      // Handle any errors that occur during the process
      this.notificationService.showError('Ein Fehler ist aufgetreten beim Verlassen des Channels.');
      //console.error(error);
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
    this.router.navigate([`/dashboard/channel/${this.idsService.mainChannelId}`]);
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
