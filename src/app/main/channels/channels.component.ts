import { Component } from '@angular/core';
import { CreateChannelDialogComponent } from './create-channel-dialog/create-channel-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss']
})
export class ChannelsComponent {

  constructor(
    public dialog: MatDialog,   
    
    ) { }

  openCreateChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent, {
      width: '880px',
      height: '514px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
    });
  }


}
