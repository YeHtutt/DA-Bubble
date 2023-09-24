import { Component } from '@angular/core';
import { ChannelService } from 'src/app/services/channel.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-channel-dialog',
  templateUrl: './create-channel-dialog.component.html',
  styleUrls: ['./create-channel-dialog.component.scss']
})
export class CreateChannelDialogComponent {

  channelNameInput: string = '';
  channelDiscription: string = '';

  constructor(
    private channelService: ChannelService,
    public dialogRef: MatDialogRef<CreateChannelDialogComponent>,
  ) { }

  addChannel() {
    let channel = {
      channelName: this.channelNameInput,
      description: this.channelDiscription,
      creationTime: this.getCurrentTimestamp(),
      creatorId: '',
      createdBy: '',
    }
    this.channelService.addChannel(channel, 'channels');
    this.closeCreateChannelDialog();
  }

  getCurrentTimestamp() {
    return this.channelService.getDateTime();
  }

  closeCreateChannelDialog() {
    this.dialogRef.close();
  }
}
