import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, map, of } from 'rxjs';

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
  messages$: Observable<any[]> = of([]);
  messages: any[] = [];


  constructor(
    private channelService: ChannelService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private userService: UsersFirebaseService,
    private changeDetectorRef: ChangeDetectorRef) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
    
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.channelId = params.get('channelId');
      this.messages$ = this.messageService.getChannelMessages('channels', this.channelId, 'channel-message').pipe(
        map((messages) => {
          this.changeDetectorRef.detectChanges();
          console.log(messages);
          return this.sortByDate(messages);
        }));
      // Using the service method to fetch the document data
      this.channelService.getDocData('channels', this.channelId).then(channelData => {
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
    this.messageService.sendMessage(this.createMessageObject(), this.receiver, false, '');
    this.text = '';
  }


  createMessageObject() {
    return new Message({
      text: this.text,
      time: new Date(),
      messageId: '',
      user: [this.currentUser]
    });
  }

}
