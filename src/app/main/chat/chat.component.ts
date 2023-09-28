import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  text: string = '';

  sendMessage() {
    // this.message.username = 'Kevin Ammerman'
    // this.message.time = new Date();
    // this.message.text = this.text;
    // this.channelService.addMessageToChannel(this.message.toJSON());
    // this.text = '';
  }
}
