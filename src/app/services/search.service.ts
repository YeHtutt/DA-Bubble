import { Injectable } from '@angular/core';
import { UsersFirebaseService } from './users-firebase.service';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  SearchResult: any = [];
  usersAndChannels: any = [];

  constructor(private userService: UsersFirebaseService, private channelService: ChannelService) { }

  async getUserAndChannelData() {
    this.usersAndChannels.users = await this.userService.getUsers();
    this.usersAndChannels.channels = await this.channelService.getChannels();
    this.userNameToLowerCase(this.usersAndChannels);
    return this.usersAndChannels;
  }

  userNameToLowerCase(array: any) {
    array.channels.forEach((c: any) => {
      c.channelName = c.channelName.toLowerCase();
    });
    array.users.forEach((u: any) => {
      u.name = u.name.toLowerCase();
    });
  }

  searchUsersAndChannels(search: string, usersAndChannels: any) {
    this.SearchResult.filteredUser = search && usersAndChannels.users.filter((user: object) => this.checkIfIncluded(user, search.toLowerCase()));
    this.SearchResult.filteredChannel = search && usersAndChannels.channels.filter((channel: object) => this.checkIfIncluded(channel, search.toLowerCase()));
    return this.SearchResult;
  }

  checkIfIncluded(obj: any, search: string) {
    const isUserMatch = obj.name && obj.name.startsWith(search);
    const isChannelMatch = obj.channelName && obj.channelName.startsWith(search);
    return isUserMatch || isChannelMatch;
  }

}
