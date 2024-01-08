import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DirectChat } from 'src/app/models/direct-chat';
import { UserProfile } from 'src/app/models/user-profile';
import { MessageService } from 'src/app/shared/services/message.service';
import { PresenceService } from 'src/app/shared/services/presence.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';


/**
 * Component for displaying a sub-view of a user profile.
 * This component provides functionality to view user details, open chat sessions,
 * and observe user presence status. It integrates with various services to manage user data,
 * message operations, and presence updates.
 */
@Component({
  selector: 'app-user-profile-sub-view',
  templateUrl: './user-profile-sub-view.component.html',
  styleUrls: ['./user-profile-sub-view.component.scss']
})
export class UserProfileSubViewComponent {
  userPhotoURL?: string;
  userName?: string;
  userEmail?: string;
  userId: string;
  presence$: Observable<any> = new Observable();


  constructor(public dialog: MatDialog,
    public userFbService: UsersFirebaseService,
    public dialogRef: MatDialogRef<UserProfileSubViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private messageService: MessageService,
    private router: Router,
    private presenceService: PresenceService
  ) {
    this.userId = data.id;
    this.userFbService.getUser(data.id).then((user: UserProfile) => {
      this.userPhotoURL = user.photoURL;
      this.userName = user.name;
      this.userEmail = user.email;
    });
  }


  ngOnInit() {
    // this.userFbService.getLoggedInUser(this.userFbService.getFromLocalStorage());
    this.presence$ = this.presenceService.getPresence(this.userId);

  }


  openChat() {
    this.prepareChatSession();
  }

  /**
  * Prepares and navigates to a chat session with a certain user.
  */
  async prepareChatSession() {
    const directChat = this.createDirectChatObject();
    const chatExists = await this.messageService.chatExists(directChat.user1, directChat.user2)
    if (!chatExists) {
      const chatId = await this.messageService.createDirectChat(directChat);
      this.router.navigateByUrl('/dashboard/chat/' + chatId);
    } else {
      const chatId = await this.messageService.getExistingChatId(directChat.user1, directChat.user2);
      this.router.navigateByUrl('/dashboard/chat/' + chatId);
    }
  }


  /**
  * Creates a DirectChat object for initiating a chat session between two users.
  * @returns {DirectChat} A new DirectChat object.
  */
  createDirectChatObject(): DirectChat {
    const currentUser = this.userFbService.getFromLocalStorage();
    return new DirectChat({
      chatId: '',
      creationTime: new Date(),
      user1: currentUser,
      user2: this.userId
    });
  }


  closeDialog() {
    this.dialog.closeAll();
  }
}
