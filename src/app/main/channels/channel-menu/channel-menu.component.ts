import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-channel-menu',
  templateUrl: './channel-menu.component.html',
  styleUrls: ['./channel-menu.component.scss']
})
export class ChannelMenuComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  channel = this.data.channel;

  ngOnInit() {
    console.log(this.channel)
  }
}
