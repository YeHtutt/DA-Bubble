import { Component, OnInit } from '@angular/core';
import { Observable, expand, map } from 'rxjs';

import { ChannelService } from 'src/app/services/channel.service';
import { ActivatedRoute } from '@angular/router';
import { ChannelMenuComponent } from '../channel-menu/channel-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { Message } from 'src/app/models/message';


@Component({
  selector: 'app-channel-chat',
  templateUrl: './channel-chat.component.html',
  styleUrls: ['./channel-chat.component.scss']
})
export class ChannelChatComponent implements OnInit {

  text: string = '';
  message: Message = new Message()
  messages$: Observable<any>;
  id: string = '';
  channelId: any = '';
  channel: any;
  ref: any;
  constructor(
    private channelService: ChannelService,
    public dialog: MatDialog,
    private route: ActivatedRoute) {
    this.messages$ = this.channelService.getChannelMessages(this.id).pipe(map((message) => {
      return this.sortByDate(message);
    }));
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

  sendMessage() {
    // this.message.username = 'Kevin Ammerman'
    // this.message.time = new Date();
    // this.message.text = this.text;
    // this.channelService.addMessageToChannel(this.message.toJSON());
    // this.text = '';
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

}
