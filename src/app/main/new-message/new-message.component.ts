import { Component, Input } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Message } from 'src/app/models/channel';
import { UserProfile } from 'src/app/models/user-profile';
import { ChannelService } from 'src/app/services/channel.service';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})
export class NewMessageComponent {

  text: string = '';
  message: Message = new Message()
  id: string = '';
  usersAndChannels: any = [];
  public search: string = '';
  filteredUser: any = [];
  filteredChannel: any = [];


  constructor(private channelService: ChannelService, private userService: UsersFirebaseService, private messageService: MessageService) {
    this.getUserAndChannelData();
  }

  async getUserAndChannelData() {
    this.usersAndChannels.users = await this.userService.getUsers();
    this.usersAndChannels.channels = await this.channelService.getChannels();
    this.userNameToLowerCase(this.usersAndChannels);
  }

  userNameToLowerCase(array: any) {
    array.channels.forEach((c: any) => {
      c.channelName = c.channelName.toLowerCase();
    });
    array.users.forEach((u: any) => {
      u.name = u.name.toLowerCase();
    });
  }

  sendMessage() {
    this.message.username = 'Kevin Ammerman'
    this.message.time = new Date();
    this.message.text = this.text;
    // this.channelService.addMessageToChannel(this.message.toJSON());
    this.text = '';
  }

  searchUsersAndChannels() {
    this.filteredUser = this.search && this.usersAndChannels.users.filter((user: object) => this.checkIfIncluded(user, this.search.toLowerCase()));
    this.filteredChannel = this.search && this.usersAndChannels.channels.filter((channel: object) => this.checkIfIncluded(channel, this.search.toLowerCase()));
    console.log('filteredUser', this.filteredUser)
    console.log('filteredChannel', this.filteredChannel)
  }

  checkIfIncluded(obj: any, search: string) {
    const isUserMatch = obj.name && obj.name.startsWith(search);
    const isChannelMatch = obj.channelName && obj.channelName.startsWith(search);
    return isUserMatch || isChannelMatch;
  }

  selectReceiver(receiver: any) {
    console.log(receiver)
    if (receiver instanceof UserProfile) {
      this.messageService.addMessageToReceiver('users', receiver.id, 'message', this.text);
    } else {
      this.messageService.addMessageToReceiver('channels', receiver.channelId, 'channel-message', this.text);
    }
  }
}
