import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Message } from 'src/app/models/channel';
import { ChannelService } from 'src/app/services/channel.service';

@Component({
  selector: 'app-channel-messages',
  templateUrl: './channel-messages.component.html',
  styleUrls: ['./channel-messages.component.scss']
})
export class ChannelMessagesComponent {

  text: string;
  message: Message = new Message()
  messages$: Observable<any>;

  constructor(private channelService: ChannelService) {
    this.messages$ = this.channelService.getChannelMessages().pipe(map((message) => {
      return this.sortByDate(message);
    }));
  }

  sortByDate(message: any) {
    return message.sort((a: any, b: any) => {
      const dateA = a.time.seconds * 1000;
      const dateB = b.time.seconds * 1000;
      return dateA - dateB;
    });
  }

  sendMessage() {
    this.message.username = 'Kevin Ammerman'
    this.message.time = new Date();
    this.message.text = this.text;
    this.channelService.addMessageToChannel(this.message.toJSON());
  }
}
