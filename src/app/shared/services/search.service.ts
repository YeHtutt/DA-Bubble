import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Message } from '../../models/message';
import { ChannelService } from './channel.service';
import { UsersFirebaseService } from './users-firebase.service';


/**
 * Service for handling search operations in an Angular application.
 * This service is responsible for searching users, channels, and messages, 
 * and integrating with Firestore for fetching message data.
 */
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

  constructor(
    private userService: UsersFirebaseService,
    private channelService: ChannelService,
    private firestore: Firestore = inject(Firestore),
    private router: Router
  ) { }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
  }


  /**
  * Loads user and channel data and optionally message data based on the search requirement.
  * @param {boolean} messageSearch - Flag to determine if message data should be loaded.
  */
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


  /**
   * Prepares users and channels for search by transforming their names.
   * @param {any} array - Array containing users and channels.
   * @param {string} search - Search string used for transformation.
   */
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


  /**
   * Transforms the search results for final display.
   * @param {any} array - Array containing filtered search results.
   */
  transformForFinalResult(array: any): void {
    array.filteredChannel.forEach((c: any) => { c.channelName = c.channelName.slice(1) });
    array.filteredUser.forEach((u: any) => { u.name = u.name.slice(1) });
  }


  /**
   * Performs a search across users, channels, and messages.
   * @param {string} search - The search string.
   * @param {boolean} messageSearch - Flag to determine if message search should be performed.
   * @returns {any} The search results containing filtered users, channels, and messages.
   */
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


  /**
   * Checks if an object (user, channel, message) should be included in search results.
   * @param {any} obj - The object to check.
   * @param {string} search - The search string to match against.
   * @returns {boolean} True if the object matches the search criteria, false otherwise.
   */
  checkIfIncluded(obj: any, search: string) {
    const isUserMatch = obj.name && obj.name.startsWith(search);
    const isChannelMatch = obj.channelName && obj.channelName.startsWith(search);
    const isMessageMatch = (obj.text && obj.text.toLowerCase().includes(search)) || (obj.user && obj.user.name && obj.user.name.toLowerCase().includes(search));
    return isUserMatch || isChannelMatch || isMessageMatch;
  }


  /**
   * Fetches messages from a specific chat path and subscribes to message updates.
   * @param {any} chatPath - The chat path to fetch messages from.
   */
  getMessages(chatPath: any): void {
    const collRef = collection(this.firestore, `${chatPath}/message`);
    const messages = collectionData(collRef);
    this.messageSubscription = messages.subscribe((message: any) => {
      this.messages = message;
    });
  }


  /**
   * Extracts the chat path from the current URL.
   */
  extractChatPathFromUrl(): void {
    const url = this.router.url;
    let urlParts = url.split('/');
    const docId = urlParts.pop();
    const coll = urlParts.pop();
    this.chatPath = `${coll}/${docId}`;
  }
}
