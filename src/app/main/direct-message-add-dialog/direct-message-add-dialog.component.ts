import { Component } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { FormControl, Validators } from '@angular/forms';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserProfile } from 'src/app/models/user-profile';
import { DirectChat } from 'src/app/models/direct-chat';



@Component({
  selector: 'app-direct-message-add-dialog',
  templateUrl: './direct-message-add-dialog.component.html',
  styleUrls: ['./direct-message-add-dialog.component.scss']
})
export class DirectMessageAddDialogComponent {


  constructor(
    private firebaseUtils: FirebaseUtilsService,
    public notificationService: NotificationService,
    private userService: UsersFirebaseService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DirectMessageAddDialogComponent>,
    private directChat: DirectChat,
  ) { }

  messageNameInput = new FormControl('', [Validators.required, Validators.minLength(3)]);
  closeDirectMessageDialog() { this.dialogRef.close(); }


  async setChatProperties(receiverId: string) {
    let creatorId = this.getCreatorId();
    let sender = (await this.userService.getUser(creatorId) as UserProfile).toJSON();
    let receiver = (await this.userService.getUser(receiverId) as UserProfile).toJSON();
    }

  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }

  startDirectChat() { }


  /*   async checkIfChatExists(directChat: DirectChat) {
      const chats = await this.getChats();
      let chatExists: boolean = false;
      if (chats) {
        chats.forEach(chat => {
          if (chat.user1 == directChat.user1 || chat.user2 == directChat.user2) {
            chatExists = chat.chatId;
          } else {
            chatExists = false;
          }
        });
      }
      return chatExists;
    } */
}
