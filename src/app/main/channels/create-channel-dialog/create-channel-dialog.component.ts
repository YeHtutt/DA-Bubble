import { Component } from '@angular/core';
import { ChannelService } from 'src/app/services/channel.service';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';


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
    private snackBar: MatSnackBar,
    private userService: UsersFirebaseService
  ) { }

  addChannel() {
    if (this.channelNameInput.invalid) {
      this.checkInputLength();
      return;
    };
    /* openDialog(); */

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

  checkInputLength(): void {
    if (this.channelNameInput.hasError('required')) {
      this.showError('Channel name is required!');
    } else if (this.channelNameInput.hasError('minlength')) {
      this.showError('Input should have at least 3 letters!');
    }
  }


  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }


  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}
