import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Channel } from 'src/app/models/channel';

@Component({
  selector: 'app-open-user-menu-dialog',
  templateUrl: './open-user-menu-dialog.component.html',
  styleUrls: ['./open-user-menu-dialog.component.scss']
})
export class OpenUserMenuDialogComponent {
  channel: Channel = new Channel(this.data.channel);
  constructor(
    public dialogRef: MatDialogRef<OpenUserMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }


  ngOnInit() {
    console.log(this.channel)
  }

  closeCreateChannelDialog() {
    this.dialogRef.close();
  }
  openPeopleUserlDialog() { }

}
