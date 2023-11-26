import { Component, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ChannelService } from 'src/app/services/channel.service';
import { FormControl } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Channel } from 'src/app/models/channel';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { AddPeopleDialogComponent } from '../add-people-dialog/add-people-dialog.component';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UsersFirebaseService,
    private channelService: ChannelService,
    public dialogRef: MatDialogRef<EditChannelDialogComponent>,
    public notificationService: NotificationService,
    private firestoreUtils: FirebaseUtilsService,
   
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
    console.log(this.isMobile);
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
      console.error(error);
    }
  }


  closeSnackbar() { }


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
