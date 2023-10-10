import { Component} from '@angular/core';
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
  // messages$: Observable<any>;
  id: string = '';
  channelId: any = '';
  channel: any;
  ref: any;
  currentUser: UserProfile = new UserProfile;
  receiver: Channel = new Channel;



  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private userService: UsersFirebaseService,
    private firebaseUtils: FirebaseUtilsService) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.channelId = params.get('channelId');
      // Using the service method to fetch the document data
      this.firebaseUtils.getDocData('channels', this.channelId).then(channelData => {
        this.channel = channelData;
        this.receiver = new Channel(channelData);
      }).catch(err => {
        console.error("Error fetching channel data:", err);
      });
    });
  }

  trackByMessageId(index: number, message: any): string {
    return message.messageId;
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
    this.message = this.createMessageObject();
    this.firebaseUtils.addMessageToCollection(coll, docId, this.message.toJSON());
  }


  createMessageObject() {
    return new Message({
      text: this.text,
      time: new Date(),  
      user: [this.currentUser]
    });
  }


  getMessage() {}

}
