import { Injectable } from '@angular/core';
import { UsersFirebaseService } from './users-firebase.service';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  SearchResult: any = [];
  usersAndChannels: any = [];

  constructor(private userService: UsersFirebaseService, private channelService: ChannelService) {

  }

  async getUserAndChannelData(chatPath: string) {
    this.usersAndChannels.users = await this.userService.getUsers();
    this.usersAndChannels.channels = await this.channelService.getChannels();
    // if(chatPath) await 
  }

  transformForSearch(array: any, search: string) {
    array.channels.forEach((c: any) => {
      c.channelName = search.startsWith('#') ? `#${c.channelName}` : c.channelName;
      c.channelName = c.channelName.toLowerCase();
    });
    array.users.forEach((u: any) => {
      u.name = search.startsWith('@') ? `@${u.name}` : u.name;
      u.name = u.name.toLowerCase();
    });
  }

  transformForFinalResult(array: any) {
    array.filteredChannel.forEach((c: any) => { c.channelName = c.channelName.slice(1) });
    array.filteredUser.forEach((u: any) => { u.name = u.name.slice(1) });
  }


  async searchUsersAndChannels(search: string, chatPath: string) {
    await this.getUserAndChannelData(chatPath);
    this.transformForSearch(this.usersAndChannels, search)
    this.SearchResult.filteredUser = search && this.usersAndChannels.users.filter((user: object) => this.checkIfIncluded(user, search.toLowerCase()));
    this.SearchResult.filteredChannel = search && this.usersAndChannels.channels.filter((channel: object) => this.checkIfIncluded(channel, search.toLowerCase()));
    if (search.length > 0 && search.includes('#') || search.includes('@')) this.transformForFinalResult(this.SearchResult)
    return this.SearchResult;
  }

  checkIfIncluded(obj: any, search: string) {
    const isUserMatch = obj.name && obj.name.startsWith(search);
    const isChannelMatch = obj.channelName && obj.channelName.startsWith(search);
    return isUserMatch || isChannelMatch;
  }




}
