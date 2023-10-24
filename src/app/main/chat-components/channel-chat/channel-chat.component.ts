import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChannelMenuComponent } from '../../channels/channel-menu/channel-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { Channel } from 'src/app/models/channel';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { SearchService } from 'src/app/services/search.service';
import { ChannelService } from 'src/app/services/channel.service';
import { AddPeopleDialogComponent } from '../../channels/add-people-dialog/add-people-dialog.component';
import { ThreadService } from 'src/app/services/thread.service';



@Component({
  selector: 'app-channel-chat',
  templateUrl: './channel-chat.component.html',
  styleUrls: ['./channel-chat.component.scss']
})
export class ChannelChatComponent {

  text: string = '';
  message: Message = new Message()
  id: string = '';
  channelId: any = '';
  channel: any;
  ref: any;
  currentUser: UserProfile = new UserProfile;
  receiver: Channel = new Channel;
  messages: Message[] = [];
  allUsers: UserProfile[] = [];
  showTagMenu: boolean = false;
  isOpened: boolean = false;


  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private userService: UsersFirebaseService,
    private firebaseUtils: FirebaseUtilsService,
    private searchService: SearchService,
    private messageService: MessageService,
    private channelService: ChannelService,
    public threadService: ThreadService) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.channelId = params.get('channelId');
      this.firebaseUtils.getDocData('channel', this.channelId).then(channelData => {
        this.channel = channelData;
        this.messageService.subMessage('channel', this.channelId);
      }).catch(err => {
        console.error("Error fetching channel data:", err);
      });
    });
  }


  openChannelMenu() {
    this.dialog.open(ChannelMenuComponent, {
      width: '872px',
      height: '616px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      data: { channel: this.channel }
    });
  }


  openPeopleUserlDialog() {
    this.dialog.open(AddPeopleDialogComponent, {
      width: '710px',
      height: 'auto',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      autoFocus: false,
      data: { channel: this.channel }
    });
  }


  sendMessageTo(coll: string, docId: string) {
    this.createMessageObject().then(async createdMessage => {
      this.message = createdMessage;
      this.receiver = await this.channelService.getSingleChannel(docId)
      this.messageService.sendMessage(this.message, this.receiver, false, '');
      this.text = '';
    });
    this.getAllMessages();
  }


  async createMessageObject() {
    let creatorId = this.getCreatorId();
    let messageCreator = (await this.userService.getUser(creatorId) as UserProfile).toJSON();
    return new Message({
      origin: 'channel',
      text: this.text,
      time: new Date(),
      user: messageCreator,
      messageId: '',
      textEdited: false,
      type: 'message',
      reactions: []
    });
  }


  addUser() { }


  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }


  getAllMessages() {
    return this.messageService.messages
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
