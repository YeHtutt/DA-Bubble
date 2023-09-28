import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Message } from 'src/app/models/channel';
import { ChannelService } from 'src/app/services/channel.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  id: string = '';
  text: string = '';
  message: Message = new Message()
  messages$: Observable<any>;

  constructor(private channelService: ChannelService) {
    this.messages$ = this.channelService.getChannelMessages(this.id).pipe(
      map((messages) => {
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

  }

}
