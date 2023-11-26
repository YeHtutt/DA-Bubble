import { Component, OnInit, ViewChild } from '@angular/core';
import { CreateChannelDialogComponent } from './create-channel-dialog/create-channel-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from 'src/app/services/channel.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { DrawerService } from 'src/app/services/drawer.service';
import { ThreadService } from 'src/app/services/thread.service';


@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss']
})
export class ChannelsComponent {

  private subscriptions: Subscription[] = [];
  currentUserId: string | null = '';

  constructor(
    public dialog: MatDialog,
    public channelService: ChannelService,
    public messageService: MessageService,
    private userService: UsersFirebaseService,
    public drawerService: DrawerService,
    public threadService: ThreadService
  ) { this.currentUserId = this.userService.getFromLocalStorage(); }

  ngOnInit() {
    const sub = this.channelService.dataLoaded.subscribe(loaded => {
      if (loaded) this.channelService.expandChannels();
    });
    this.subscriptions.push(sub);
  }


  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  openCreateChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
      panelClass: 'create-channel-dialog',
      autoFocus: false,
    });
  }

  toggleExpanded(node: any) {
    // Code to toggle the expanded state of the node
    this.channelService.treeControl.toggle(node);
  }
}
