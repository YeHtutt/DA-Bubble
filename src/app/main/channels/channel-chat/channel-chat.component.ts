import { Component, OnInit } from '@angular/core';
import { Observable, expand, map } from 'rxjs';

import { ChannelService } from 'src/app/services/channel.service';
import { ActivatedRoute } from '@angular/router';
import { ChannelMenuComponent } from '../channel-menu/channel-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { Channel } from 'src/app/models/channel';


@Component({
  selector: 'app-channel-chat',
  templateUrl: './channel-chat.component.html',
  styleUrls: ['./channel-chat.component.scss']
})
export class ChannelChatComponent implements OnInit {

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
    private channelService: ChannelService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private userService: UsersFirebaseService) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
    // this.messages$ = this.messageService.getChannelMessages(this.id).pipe(map((message) => {
    //   return this.sortByDate(message);
    // }));
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.channelId = params.get('channelId');

      // Using the service method to fetch the document data
      this.channelService.getDocData('channels', this.channelId).then(channelData => {
        this.channel = channelData;
      }).catch(err => {
        console.error("Error fetching channel data:", err);
      });
    });
  }


  getChannel() {

  }

  sortByDate(message: any) {
    return message.sort((a: any, b: any) => {
      const dateA = a.time.seconds * 1000;
      const dateB = b.time.seconds * 1000;
      return dateA - dateB;
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

  // SEND MESSAGE

  send() {
    console.log(this.currentUser)
    this.createMessageObject();
    this.messageService.sendMessage(this.message, this.channelId, false);
    this.message = new Message();
  }

  createMessageObject() {
    this.message.text = this.text;
    this.message.time = new Date();
    this.message.messageId || '';
    this.message.user.push(this.currentUser);
  }

}
