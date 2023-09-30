import { Component, Input } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Message } from 'src/app/models/channel';
import { UserProfile } from 'src/app/models/user-profile';
import { ChannelService } from 'src/app/services/channel.service';
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
  users: any;
  search: string = '';


  constructor(private channelService: ChannelService, private userService: UsersFirebaseService) {
    this.getUsersArray();
    console.log(this.channelService.dataSource)
  }

  async getUsersArray() {
    this.users = await this.userService.getUsers();
    this.userNameToLowerCase(this.users);
  }

  userNameToLowerCase(user: any) {
    user.forEach((u: any) => {
      u.name = u.name.toLowerCase();
    });
  }

  sendMessage() {
    this.message.username = 'Kevin Ammerman'
    this.message.time = new Date();
    this.message.text = this.text;
    this.channelService.addMessageToChannel(this.message.toJSON());
    this.text = '';
  }

  searchUsersAndChannels() {
    const filtered = this.users.filter((user: object) => this.checkIfIncluded(user, this.search));
    console.log(filtered)
  }

  checkIfIncluded(user:any, search: string) {
    return user.name.startsWith(search);
  }
}
