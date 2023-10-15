import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageTreeService } from 'src/app/services/message-tree.service';
import { DirectMessageAddDialogComponent } from '../direct-message-add-dialog/direct-message-add-dialog.component';
import { Subscription } from 'rxjs';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UserProfile } from 'src/app/models/user-profile';


@Component({
  selector: 'app-direct-message',
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss']
})
export class DirectMessageComponent {

  constructor(
    public messageTreeService: MessageTreeService,
    public dialog: MatDialog,
    private userService: UsersFirebaseService,
  ) { }

  private subscriptions: Subscription[] = [];


  openDirectMessageDialog() {
    this.dialog.open(DirectMessageAddDialogComponent, {
      width: '880px',
      height: '514px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',

    });
  }

  ngOnInit() {
    const sub = this.messageTreeService.dataLoaded.subscribe(loaded => {
      if (loaded) {
        this.messageTreeService.treeControl.expandAll();
      }
    });
    this.subscriptions.push(sub);
    this.messageTreeService.subUserMessagesList();
  }

  toggleExpanded(node: any) {
    this.messageTreeService.treeControl.toggle(node);
  }

  createChat(receiverId: string) {
    this.setChatProperties(receiverId)
  }


  async setChatProperties(receiverId: string) {
    let creatorId = this.getCreatorId();
    let sender = (await this.userService.getUser(creatorId) as UserProfile).toJSON();
    let receiver = (await this.userService.getUser(receiverId) as UserProfile).toJSON();
    console.log(receiver, sender)
  }

  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }

  startDirectChat() { }

}
