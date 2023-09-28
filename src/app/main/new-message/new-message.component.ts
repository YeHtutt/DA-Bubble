import { Component } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Message } from 'src/app/models/channel';
import { ChannelService } from 'src/app/services/channel.service';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})
export class NewMessageComponent {

  text: string = '';
  message: Message = new Message()
  id: string = '';


  constructor(private channelService: ChannelService) {}


  sendMessage() {
    this.message.username = 'Kevin Ammerman'
    this.message.time = new Date();
    this.message.text = this.text;
    this.channelService.addMessageToChannel(this.message.toJSON());
    this.text = '';
  }
}
