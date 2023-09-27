import { Component, OnInit } from '@angular/core';
import { Observable, expand, map } from 'rxjs';
import { Message } from 'src/app/models/channel';
import { ChannelService } from 'src/app/services/channel.service';

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

  constructor(private channelService: ChannelService) {
    this.messages$ = this.channelService.getChannelMessages(this.id).pipe(map((message) => {
      return this.sortByDate(message);
    }));
  }

  ngOnInit() {
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
