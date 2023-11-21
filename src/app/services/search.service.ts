import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Message } from '../models/message';
import { ChannelService } from './channel.service';
import { UsersFirebaseService } from './users-firebase.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  SearchResult: any = [];
  usersAndChannels: any = [];
  messages: any = []
  search: string = '';
  chatPath: any;
  private messageSubscription?: Subscription;

  constructor(private userService: UsersFirebaseService, private channelService: ChannelService, private firestore: Firestore = inject(Firestore), private router: Router) {

  }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
  }


  async loadData(messageSearch: boolean) {
    this.usersAndChannels.users = await this.userService.getUsers();
    this.usersAndChannels.channels = await this.channelService.getChannels();
    if (messageSearch && !this.messageSubscription || this.messageSubscription?.closed) {
      this.loadMessageDataAndSubscribe();
    }
    if (this.search === '') this.messageSubscription?.unsubscribe();
  }


  loadMessageDataAndSubscribe(): void {
    this.messages = [];
    this.extractChatPathFromUrl();
    this.getMessages(this.chatPath);
  }


  transformForSearch(array: any, search: string): void {
    array.channels.forEach((c: any) => {
      c.channelName = search.startsWith('#') ? `#${c.channelName}` : c.channelName;
      c.channelName = c.channelName.toLowerCase();
    });
    array.users.forEach((u: any) => {
      u.name = search.startsWith('@') ? `@${u.name}` : u.name;
      u.name = u.name.toLowerCase();
    });
  }


  transformForFinalResult(array: any): void {
    array.filteredChannel.forEach((c: any) => { c.channelName = c.channelName.slice(1) });
    array.filteredUser.forEach((u: any) => { u.name = u.name.slice(1) });
  }


  async searchUsersChannelsAndMessages(search: string, messageSearch: boolean) {
    this.search = search;
    await this.loadData(messageSearch);
    this.transformForSearch(this.usersAndChannels, search)
    this.SearchResult.filteredUser = search && this.usersAndChannels.users.filter((user: object) => this.checkIfIncluded(user, search.toLowerCase()));
    this.SearchResult.filteredChannel = search && this.usersAndChannels.channels.filter((channel: object) => this.checkIfIncluded(channel, search.toLowerCase()));
    this.SearchResult.filteredMessages = search && this.messages.filter((message: Message) => this.checkIfIncluded(message, search.toLowerCase()))
    if (search.length > 0 && search.includes('#') || search.includes('@')) this.transformForFinalResult(this.SearchResult)
    return this.SearchResult;
  }


  checkIfIncluded(obj: any, search: string) {
    const isUserMatch = obj.name && obj.name.startsWith(search);
    const isChannelMatch = obj.channelName && obj.channelName.startsWith(search);
    const isMessageMatch = (obj.text && obj.text.toLowerCase().includes(search)) || (obj.user && obj.user.name && obj.user.name.toLowerCase().includes(search));
    return isUserMatch || isChannelMatch || isMessageMatch;
  }


  getMessages(chatPath: any): void {
    const collRef = collection(this.firestore, `${chatPath}/message`);
    const messages = collectionData(collRef);
    this.messageSubscription = messages.subscribe((message: any) => {
      this.messages = message;
    });
  }


  extractChatPathFromUrl(): void {
    const url = this.router.url;
    let urlParts = url.split('/');
    const docId = urlParts.pop();
    const coll = urlParts.pop();
    this.chatPath = `${coll}/${docId}`;
  }
}
