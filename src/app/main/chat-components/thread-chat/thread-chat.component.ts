import { Component } from '@angular/core';
import { UserProfile } from 'src/app/models/user-profile';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-thread-chat',
  templateUrl: './thread-chat.component.html',
  styleUrls: ['./thread-chat.component.scss']
})
export class ThreadChatComponent {

  isOpened: boolean = false;
  text: string = '';
  showTagMenu: boolean = false;
  allUsers: UserProfile[] = [];


  constructor(private searchService: SearchService) { }

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

  sendMessageTo(messageId: string) {

  }

}
