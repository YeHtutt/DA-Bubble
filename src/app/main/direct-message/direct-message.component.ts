import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageTreeService } from 'src/app/services/message-tree.service';
import { DirectMessageAddDialogComponent } from '../direct-message-add-dialog/direct-message-add-dialog.component';
import { Subscription } from 'rxjs';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UserProfile } from 'src/app/models/user-profile';
import { MessageService } from 'src/app/services/message.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { Message } from 'src/app/models/message';
import { DirectChat } from 'src/app/models/direct-chat';
import { Router } from '@angular/router';

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
    private messageService: MessageService,
    private router: Router,
    private firebaseUtils: FirebaseUtilsService,
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

  async selectReceiver(receiverId: any) {
    const chatAlreadyExists = await this.firebaseUtils.chatExists(this.currentUser.id, receiverId);

    if (!chatAlreadyExists) {
      let newDirectChat = this.createDirectChatObject(receiverId).toJSON();
      this.firebaseUtils.addColl(newDirectChat, 'chat', 'chatId');
    } else {
      console.log('Chat already exists between the users.');
      // Assuming you can retrieve the chatId of the existing chat. Adjust as needed.
      const chatId = await this.firebaseUtils.getExistingChatId(this.currentUser.id, receiverId);    
      this.router.navigate(['/main/chat', chatId]);
    }
  }

  setChatProperties() { }

  createDirectChatObject(receiver: string): DirectChat {
    return new DirectChat({
      chatId: '',
      creationTime: new Date(),
      user1: this.currentUser.id,
      user2: receiver
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
      textEdited: false
    });
  }


  async getReceiverData() {
    this.chat = await this.messageService.getDirectChatDoc(this.chatId);
    this.checkWhoReceiverIs();
    this.userService.getUser(this.checkWhoReceiverIs()).then((user: any) => { this.receiver = user });
  }


  checkWhoReceiverIs() {
    if (this.chat.user1 == this.currentUser.id) {
      return this.chat.user2;
    } else {
      return this.chat.user1;
    }
  }


  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }

  startDirectChat() {


  }

}
