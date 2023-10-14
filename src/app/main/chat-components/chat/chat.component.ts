import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { DirectChat } from 'src/app/models/direct-chat';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { MessageTreeService } from 'src/app/services/message-tree.service';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { MessageService } from 'src/app/services/message.service';
import { SearchService } from 'src/app/services/search.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  chatId: string = '';
  chat: any;
  text: string = '';
  message: Message = new Message();
  chatExists: boolean = false;
  currentUser: UserProfile = new UserProfile;
  public receiver: UserProfile = new UserProfile;
  allUsers: UserProfile[] = [];
  showTagMenu: boolean = false;

  constructor(
    private messageService: MessageService,
    private route: ActivatedRoute,
    private userService: UsersFirebaseService,
    private firebaseUtils: FirebaseUtilsService,
    private searchService: SearchService
  ) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.chatId = params.get('id') || '';
 /*      this.getReceiverData();
      this.firebaseUtils.getDocData('chat', this.chatId).then( () => {
        this.firebaseUtils.subMessage('chat', this.chatId);
      }).catch(err => {
        console.error("Error fetching channel data:", err);
      }); */
    });
  }

  getAllMessages() {
    if (this.messageService.messages.length > 0) this.chatExists = true;
    return this.messageService.messages
  }


  async getReceiverData() {
    this.chat = await this.messageService.getDirectChatDoc(this.chatId);
    this.checkWhoReceiverIs();
    this.userService.getUser(this.checkWhoReceiverIs()).then((user: any) => { this.receiver = user });
  }


  checkWhoReceiverIs() {
    if (this.chat.user1 == this.currentUser.id) {
      return this.chat.user2;
    } else {
      return this.chat.user1;
    }
  }


  send() {
    this.messageService.sendMessage(this.createMessageObject(), this.chatId, false, '');
    this.text = '';
  }


  createMessageObject() {
    return new Message({
      text: this.text,
      time: new Date(),
      messageId: '',
      user: this.currentUser.toJSON()
    });
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
}