import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ChannelService } from 'src/app/services/channel.service';
import { FormControl, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';



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
    public utilsService: UtilsService
  ) { }

  channel = this.data.channel;
  currentUserId: string | null = '';

  channelNameInput = new FormControl(this.channel.channelName);
  channelDescriptionInput = new FormControl(this.channel.description);

  ngOnInit() {
    console.log(this.channel)
    this.currentUserId = this.userService.getFromLocalStorage()
  }


  closeCreateChannelDialog() {
    this.dialogRef.close();
  }

  leaveChannel() {

  }

  editDescription() {

  }

  editChannelName() {

  }

  deleteChannel() {
    if (this.currentUserId == this.channel.creatorId) {
      this.channelService.deleteChannel(this.channel);
    }
  }


}
