import { Component } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Message } from 'src/app/models/channel';
import { ChannelService } from 'src/app/services/channel.service';

@Component({
  selector: 'app-direct-messages',
  templateUrl: './direct-messages.component.html',
  styleUrls: ['./direct-messages.component.scss']
})
export class DirectMessagesComponent {

  text: string = '';
  message: Message = new Message()
  messages$: Observable<any>;
  id: string = '';
  hasData: boolean = false;

  // constructor(private channelService: ChannelService) {
  //   this.messages$ = this.channelService.getChannelMessages(this.id).pipe(map((message) => {
  //     return this.sortByDate(message);
  //   }));
  //   console.log(this.messages$)
  // }

  constructor(private channelService: ChannelService) {
    this.messages$ = this.channelService.getChannelMessages(this.id).pipe(
      tap((messages) => {
        if (messages && messages.length > 0) {
          this.hasData = true;
        }
      }), map((messages) => {
        return this.sortByDate(messages);
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
    this.text = '';
  }
}
