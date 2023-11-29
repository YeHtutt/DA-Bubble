import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DirectChat } from 'src/app/models/direct-chat';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { DrawerService } from 'src/app/services/drawer.service';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { MessageTreeService } from 'src/app/services/message-tree.service';
import { MessageService } from 'src/app/services/message.service';
import { ThreadService } from 'src/app/services/thread.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';


@Component({
  selector: 'app-direct-chat',
  templateUrl: './direct-chat.component.html',
  styleUrls: ['./direct-chat.component.scss']
})
export class DirectChatComponent {

  constructor(
    public messageTreeService: MessageTreeService,
    public dialog: MatDialog,
    private userService: UsersFirebaseService,
    private router: Router,
    private firebaseUtils: FirebaseUtilsService,
    private drawerService: DrawerService,
    private threadService: ThreadService,
    private messageService: MessageService,
  ) { this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user }); }

  private subscriptions: Subscription[] = [];
  chatId: string = '';
  chat: any;
  text: string = '';
  message: Message = new Message();
  chatExists: boolean = false;
  currentUser: UserProfile = new UserProfile;
  public receiver: UserProfile = new UserProfile;
  public search: string = '';
  filteredUser: any = [];


  ngOnInit() {
    const sub = this.messageTreeService.dataLoaded.subscribe(loaded => {
      if (loaded) {
        this.messageTreeService.treeControl.expandAll();
      }
    });
    this.subscriptions.push(sub);
  }


  async selectReceiver(receiverId: any) {
    const chatAlreadyExists = await this.messageService.chatExists(this.currentUser.id, receiverId);
    if (!chatAlreadyExists) {
      let newDirectChat = this.createDirectChatObject(receiverId).toJSON();
      this.firebaseUtils.addCollWithCustomId(newDirectChat, 'chat', newDirectChat.chatId);
    }
    const chatId = await this.messageService.getExistingChatId(this.currentUser.id, receiverId);
    this.router.navigate(['/main/chat', chatId]);
    this.drawerService.close();
    if (this.threadService.threadIsOpen) this.threadService.closeThread();
  }

  createDirectChatObject(receiver: string): DirectChat {
    return new DirectChat({
      chatId: `${this.currentUser.id}_${receiver}`,
      creationTime: new Date(),
      user1: this.currentUser.id,
      user2: receiver,
    });
  }


  toggleExpanded(node: any) {
    this.messageTreeService.treeControl.toggle(node);
  }


  createMessageObject() {
    return new Message({
      text: this.text,
      time: new Date(),
      messageId: '',
      user: this.currentUser.toJSON(),
      type: 'message',
      textEdited: false
    });
  }


  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }


}

