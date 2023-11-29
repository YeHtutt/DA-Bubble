import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DirectChat } from 'src/app/models/direct-chat';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

@Component({
  selector: 'app-user-profile-sub-view',
  templateUrl: './user-profile-sub-view.component.html',
  styleUrls: ['./user-profile-sub-view.component.scss']
})
export class UserProfileSubViewComponent {
  userPhotoURL: string;
  userName: string;
  userEmail: string;
  userId: string;


  ngOnInit() {
    this.userFbService.getLoggedInUser(this.userFbService.getFromLocalStorage());
  }
  

  constructor(public dialog: MatDialog, public userFbService: UsersFirebaseService,
    public dialogRef: MatDialogRef<UserProfileSubViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private messageService: MessageService,
    private router: Router) {
    this.userPhotoURL = data.photoURL;
    this.userName = data.name;
    this.userEmail = data.email;
    this.userId = data.id;
  }


  onNoClick() {

  }


  async openChat() {
    const directChat = this.createDirectChatObject();
    const chatId = await this.messageService.createDirectChat(directChat);
    this.router.navigateByUrl('/main/chat/' + chatId);
  }


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
