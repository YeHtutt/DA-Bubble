import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { ThreadService } from 'src/app/shared/services/thread.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';
import { CreateChannelDialogComponent } from './create-channel-dialog/create-channel-dialog.component';


/**
 * Component for displaying and managing channel functionalities.
 * This component allows users to view, navigate, and create channels.
 * It integrates with various services for channel operations, navigation, and dialog management.
 */
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
    public threadService: ThreadService,
    private router: Router
  ) { this.currentUserId = this.userService.getFromLocalStorage(); }


  ngOnInit() {
    const sub = this.channelService.dataLoaded.subscribe(loaded => {
      if (loaded) this.channelService.expandChannels();
    });
    this.subscriptions.push(sub);
    this.channelService.unsubChannelTree = this.channelService.subChannelTree();
  }


  /**
  * Cleans up subscriptions when the component is destroyed.
  */
  ngOnDestroy() {
    this.channelService.unsubChannelTree();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  selectLevel(nodeId: string) {
    this.router.navigate(['dashboard/channel/' + nodeId]);
  }


  openCreateChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
      panelClass: 'channel-dialog',
      autoFocus: false,
    });
  }

  toggleExpanded(node: any) {
    this.channelService.treeControl.toggle(node);
  }
}