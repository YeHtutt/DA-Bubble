import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { Channel } from 'src/app/models/channel';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { ChannelService } from 'src/app/services/channel.service';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';


type ReceiverType = UserProfile | Channel;

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
  receiver: ReceiverType = new UserProfile;
  currentUser: UserProfile = new UserProfile;


  constructor(
    private channelService: ChannelService,
    private userService: UsersFirebaseService,
    private messageService: MessageService,
    private router: Router

  ) {
    this.getUserAndChannelData();
    this.userService.getCurrentUser(this.userService.getFromLocalStorage()).then((user: any) => {
      this.currentUser = user;
    });
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
    this.createMessageObject();
    if (this.receiver instanceof UserProfile) {
      this.messageService.uploadMessage('users', this.receiver.id, 'message', this.message);
      this.router.navigateByUrl('/main/chat/' + this.receiver.id);
    } else {
      this.messageService.uploadMessage('channels', this.receiver.channelId, 'channel-message', this.message);
      this.router.navigateByUrl('/main/channel/' + this.receiver.channelId);
    }
  }

  createMessageObject() {
    this.message.text = this.text;
    this.message.time = new Date();
    this.message.messageId || '';
    this.message.user.push(this.currentUser);
  }

  searchUsersAndChannels() {
    this.filteredUser = this.search && this.usersAndChannels.users.filter((user: object) => this.checkIfIncluded(user, this.search.toLowerCase()));
    this.filteredChannel = this.search && this.usersAndChannels.channels.filter((channel: object) => this.checkIfIncluded(channel, this.search.toLowerCase()));
  }

  checkIfIncluded(obj: any, search: string) {
    const isUserMatch = obj.name && obj.name.startsWith(search);
    const isChannelMatch = obj.channelName && obj.channelName.startsWith(search);
    return isUserMatch || isChannelMatch;
  }

  selectReceiver(receiver: any) {
    this.search = receiver.name || receiver.channelName;
    this.receiver = receiver;
    this.filteredChannel = [];
    this.filteredUser = [];
    // this.checkIfChatAlreadyExists();
  }

  // checkIfChatAlreadyExists() {
  //   if (this.receiver instanceof UserProfile) {
  //     this.userService.checkIfSubcollectionExists(`user/${this.receiver.id}/message`);
  //     // this.router.navigateByUrl('/main/chat/' + this.receiver.id);
  //     console.log(this.receiver.id)
  //   }
  //   if (this.receiver instanceof Channel) {
  //     this.userService.checkIfSubcollectionExists(`channel/${this.receiver.channelId}/channel-message`);
  //     // this.router.navigateByUrl('/main/channel/' + this.receiver.channelId);
  //   } 
  // }
}
