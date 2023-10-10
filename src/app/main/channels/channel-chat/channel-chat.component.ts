import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ChannelMenuComponent } from '../channel-menu/channel-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { Channel } from 'src/app/models/channel';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';

@Component({
  selector: 'app-channel-chat',
  templateUrl: './channel-chat.component.html',
  styleUrls: ['./channel-chat.component.scss']
})
export class ChannelChatComponent {

  text: string = '';
  message: Message = new Message()
  id: string = '';
  channelId: any = '';
  channel: any;
  ref: any;
  currentUser: UserProfile = new UserProfile;
  receiver: Channel = new Channel;
  messages: Message[] = [];

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private userService: UsersFirebaseService,
    private firebaseUtils: FirebaseUtilsService) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.channelId = params.get('channelId');
      this.firebaseUtils.getDocData('channels', this.channelId).then(channelData => {
        this.channel = channelData;
        this.firebaseUtils.subMessage('channels', this.channelId)
      }).catch(err => {
        console.error("Error fetching channel data:", err);
      });
    });
  }


  openChannelMenu() {
    this.dialog.open(ChannelMenuComponent, {
      width: '872px',
      height: '616px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      data: { channel: this.channel }
    });
  }


  sendMessageTo(coll: string, docId: string) {
    this.createMessageObject().then(createdMessage => {
      this.message = createdMessage;
      this.firebaseUtils.addMessageToCollection(coll, docId, this.message.toJSON());
    });
    this.getAllMessages();
  }


  async createMessageObject() {
    let creatorId = this.getCreatorId();
    let messageCreator = (await this.userService.getUser(creatorId) as UserProfile).toJSON();
    return new Message({
      text: this.text,
      time: new Date(),
      user: messageCreator
    });
  }


  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }


  getAllMessages() {
    return this.firebaseUtils.messages
  }

}
