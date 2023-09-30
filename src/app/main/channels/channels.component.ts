import { Component } from '@angular/core';
import { CreateChannelDialogComponent } from './create-channel-dialog/create-channel-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from 'src/app/services/channel.service';


@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss']
})
export class ChannelsComponent {

  constructor(
    public dialog: MatDialog,
    public channelService: ChannelService,
  ) { }

  ngOnInit() {
  }

  openCreateChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent, {
      width: '880px',
      height: '514px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
    });
  }

  openChannel(channelId: string) {
    this.channelService.setChannelId(channelId);
    console.log(channelId)
   }

  toggleExpanded(node: any) {
    // Code to toggle the expanded state of the node
    this.channelService.treeControl.toggle(node);
  }

  


}
