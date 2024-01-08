import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DirectChat } from 'src/app/models/direct-chat';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { FirebaseUtilsService } from 'src/app/shared/services/firebase-utils.service';
import { MessageTreeService } from 'src/app/shared/services/message-tree.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { ThreadService } from 'src/app/shared/services/thread.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';


/**
* Component for handling direct chat functionality.
* This component provides functionality to manage and initiate direct chats between users.
* It integrates with various services for message and user data management, navigation, and UI interactivity.
*/
@Component({
  selector: 'app-direct-chat',
  templateUrl: './direct-chat.component.html',
  styleUrls: ['./direct-chat.component.scss']
})
export class DirectChatComponent {

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


  ngOnInit() {
    const sub = this.messageTreeService.dataLoaded.subscribe(loaded => {
      if (loaded) {
        this.messageTreeService.treeControl.expandAll();
      }
    });
    this.subscriptions.push(sub);
  }


  /**
  * Selects a receiver for direct chat, checks for existing chats, and navigates to the chat if it exists.
  * @param {any} receiverId - The ID of the receiver to initiate a direct chat with.
  */
  async selectReceiver(receiverId: any) {
    const chatAlreadyExists = await this.messageService.chatExists(this.currentUser.id, receiverId);
    if (!chatAlreadyExists) {
      let newDirectChat = this.createDirectChatObject(receiverId).toJSON();
      await this.firebaseUtils.addColl(newDirectChat, 'chat', 'chatId');
    }
    const chatId = await this.messageService.getExistingChatId(this.currentUser.id, receiverId);
    this.router.navigate(['/dashboard/chat', chatId]);
    this.drawerService.close();
    if (this.threadService.threadIsOpen) this.threadService.closeThread();
  }


  /**
  * Creates a new DirectChat object(basically a conversation between to users).
  * @param {string} receiver - The ID of the receiver for the direct chat.
  * @returns {DirectChat} A new DirectChat object.
  */
  createDirectChatObject(receiver: string): DirectChat {
    return new DirectChat({
      chatId: '',
      creationTime: new Date(),
      user1: this.currentUser.id,
      user2: receiver,
    });
  }


  /**
  * Toggles the expanded state of a node in the message tree.
  * @param {any} node - The node to toggle.
  */
  toggleExpanded(node: any) {
    this.messageTreeService.treeControl.toggle(node);
  }

  /**
  * Retrieves the ID of the current user (the sender of the message) from local storage.
  * @returns {string} The ID of the current user.
  */
  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }
}