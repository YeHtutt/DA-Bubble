import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Channel } from 'src/app/models/channel';
import { DirectChat } from 'src/app/models/direct-chat';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { MessageService } from 'src/app/services/message.service';
import { SearchService } from 'src/app/services/search.service';
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
  searchOutput: boolean = false;
  allUsers: UserProfile[] = [];
  showTagMenu: boolean = false;
  isOpened: boolean = false;


  constructor(
    private userService: UsersFirebaseService,
    private messageService: MessageService,
    private searchService: SearchService

  ) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }

  send() {
    if (this.receiver instanceof UserProfile) {
      let origin = 'chat';
      this.messageService.sendMessage(this.createMessageObject(origin), this.receiver, true, this.createDirectChatObject(this.receiver),);
    } else {
      let origin = 'channel';
      this.messageService.sendMessage(this.createMessageObject(origin), this.receiver, true, '');
    }
    this.text = '';
  }

  createDirectChatObject(receiver: UserProfile): DirectChat {
    return new DirectChat({
      chatId: '',
      creationTime: new Date(),
      user1: this.currentUser.id,
      user2: receiver.id
    });
  }

  createMessageObject(origin: string) {
    return new Message({
      origin: origin,
      text: this.text,
      time: new Date(),
      messageId: '',
      user: this.currentUser.toJSON(),
      textEdited: false,
      type: 'message',
      reactions: []
    });
  }


  async searchData() {
    const searchResult = await this.searchService.searchUsersAndChannels(this.search)
    this.filteredUser = searchResult.filteredUser;
    this.filteredChannel = searchResult.filteredChannel;
  }

  selectReceiver(receiver: any) {
    this.search = receiver.name || `# ${receiver.channelName}`;
    this.receiver = receiver;
    this.filteredChannel = [];
    this.filteredUser = [];
  }

  toggleSearchOutput() {
    this.searchOutput = !this.searchOutput;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('input') && !target.closest('.searchOutput')) {
      this.searchOutput = false;
    }
  }


  async openTagMenu() {
    this.showTagMenu = !this.showTagMenu;
    const searchResult = await this.searchService.searchUsersAndChannels('@');
    this.allUsers = searchResult.filteredUser;
    setTimeout(() => this.showTagMenu = !this.showTagMenu, 8000);
  }

  tagUser(user: string) {
    this.text = `@${user}`;
    this.showTagMenu = !this.showTagMenu;
  }

  toggleEmoji() {
    this.isOpened = !this.isOpened;
  }

  addEmoji(emoji: string) {
    const text = `${emoji}`;
    this.text += text;
    this.isOpened = false;
  }
}