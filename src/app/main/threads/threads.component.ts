import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThreadService } from 'src/app/services/thread.service';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { UserProfile } from 'src/app/models/user-profile';
import { Thread } from 'src/app/models/thread';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent {

  currentId: string = '';
  messageCreator: any;
  message: any;
  private subscriptions = new Subscription();
  isOpened: boolean = false;
  text: string = '';
  showTagMenu: boolean = false;
  allUsers: UserProfile[] = [];
  currentUser: UserProfile = new UserProfile;



  constructor(
    private route: ActivatedRoute,
    public threadService: ThreadService,
    private searchService: SearchService,
    private userService: UsersFirebaseService,
  ) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      let channelId = params['channelId'];
      let chatId = params['chatId'];
      if (channelId) this.currentId = channelId;
      else if (chatId) this.currentId = chatId;
    });

    this.subscriptions.add(
      this.threadService.message$.subscribe(message => {
        this.messageCreator = message.user;
        this.message = message
      })
    );
  }


  getTimeOfDate(timestamp: any) {
    const date = new Date(timestamp.seconds * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formattedTime;
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

  setReply() {

  }


  createReplyObject() {
    return new Thread({
      text: this.text,
      time: new Date(),
      threadId: '',
      user: this.currentUser.toJSON(),
      textEdited: false,
      reactions: []
    });
  }


  sendMessageTo(origin: string) {
    this.threadService.addMessageToCollection(origin, this.currentId, this.message.messageId, this.createReplyObject().toJSON())
  }

}
