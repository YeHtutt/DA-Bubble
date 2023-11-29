import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Channel } from 'src/app/models/channel';
import { AddPeopleDialogComponent } from '../add-people-dialog/add-people-dialog.component';

@Component({
  selector: 'app-open-user-menu-dialog',
  templateUrl: './open-user-menu-dialog.component.html',
  styleUrls: ['./open-user-menu-dialog.component.scss']
})
export class OpenUserMenuDialogComponent {


  channel: Channel = new Channel(this.data.channel);
  @Input() isMobile: boolean = false;
  openingInChat: boolean = this.data.openingInChat;


  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<OpenUserMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }


  closeCreateChannelDialog() {
    this.dialogRef.close();
  }


  addUserDialog() {
    let dialogStyle;
    if (this.openingInChat) { dialogStyle = 'corner-right-top-dialog'; }
    if (!this.openingInChat) { dialogStyle = 'top-left-right-dialog'; }
    this.dialog.open(AddPeopleDialogComponent, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
      panelClass: dialogStyle,
      autoFocus: false,
      data: {
        channel: this.channel,
        openingInChat: this.openingInChat
      }
    });

  }

}
