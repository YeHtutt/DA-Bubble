import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChannelMenuComponent } from '../../channels/channel-menu/channel-menu.component';
import { AddPeopleDialogComponent } from '../../channels/add-people-dialog/add-people-dialog.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { DatePipe } from '@angular/common';
/* Models */

import { Message } from 'src/app/models/message';
import { Channel } from 'src/app/models/channel';
import { UserProfile } from 'src/app/models/user-profile';

/* Services */

import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { SearchService } from 'src/app/services/search.service';
import { ThreadService } from 'src/app/services/thread.service';
import { ChannelService } from 'src/app/services/channel.service';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { FileUpload } from 'src/app/models/file-upload';
import { NotificationService } from 'src/app/services/notification.service';
import { DrawerService } from 'src/app/services/drawer.service';


@Component({
  selector: 'app-channel-chat',
  templateUrl: './channel-chat.component.html',
  styleUrls: ['./channel-chat.component.scss'],
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
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
  scrollElement: any;
  messageCount: any;
  fileUpload?: FileUpload;
  fileType: string = '';
  groupedMessages: any;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private userService: UsersFirebaseService,
    private firebaseUtils: FirebaseUtilsService,
    private searchService: SearchService,
    private messageService: MessageService,
    private channelService: ChannelService,
    public threadService: ThreadService,
    private fileService: FileStorageService,
    private notificationService: NotificationService,
    public drawerService: DrawerService,
    private datePipe: DatePipe) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.channelId = params.get('channelId');
      this.firebaseUtils.getDocData('channel', this.channelId).then(channelData => {
        this.channel = channelData;
        this.messageService.subMessage('channel', this.channelId);
        this.channelService.unsubChannel = this.channelService.subChannelContent(this.channelId, channelData => {
          this.channel = channelData;
        });
        this.groupedMessages = this.groupMessagesByDate(this.messageService.messages);
      }).catch(err => {
        console.error("Error fetching channel data:", err);
      });
    });
  }





  groupMessagesByDate(messagesToGroup: any) {
    const groupedMessages: any = [];
    let currentDate: string | null = null;
    let index = -1;

    messagesToGroup.forEach((message: any) => {
      // Convert Firestore Timestamp to JavaScript Date object
      const messageDateObject = (message.time as any).toDate();
      // Format the date using German locale
      const messageDate = this.datePipe.transform(messageDateObject, 'EEEE, d. MMMM', 'de');

      if (messageDate !== currentDate) {
        currentDate = messageDate;
        index++;
        groupedMessages[index] = {
          date: currentDate,
          messages: []
        };
      }
      groupedMessages[index].messages.push({ ...message});
    });

    console.log(groupedMessages);
    return groupedMessages;
  }






  getAllMessages() {
    return this.messageService.messages
  }


  openChannelMenu() {
    this.dialog.open(ChannelMenuComponent, {
      width: '872px',
      height: '616px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      autoFocus: false,
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
      this.fileUpload = undefined;
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
      reactions: [],
      fileUpload: this.fileUpload?.toJSON() || []
    });
  }


  getCreatorId() {
    return this.userService.getFromLocalStorage();
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

  // Upload File

  onUpload(event: any) {
    const file = new FileUpload(event.target.files[0]);
    const maxSize = 1500 * 1024;
    this.setFileType(file.file.type);
    if (file.file.size > maxSize) {
      this.notificationService.showError('Die Datei ist zu groß. Bitte senden Sie eine Datei, die kleiner als 500KB ist.');
      return;
    } else if (!file.file.type.match(/image\/(png|jpeg|jpg)|application\/pdf/)) {
      this.notificationService.showError('Bitte nur png, jpg, jpeg oder PDF senden.');
      return;
    } else {
      this.fileService.uploadFile(file).then(file => this.fileUpload = file);
    }
  }

  setFileType(type: string) {
    if (type.includes('jpeg' || 'jpg')) this.fileType = 'assets/img/icons/jpg.png';
    if (type.includes('png')) this.fileType = 'assets/img/icons/png.png';
    if (type.includes('pdf')) this.fileType = 'assets/img/icons/pdf.png';
  }

  onDelete(filePath: string) {
    this.fileService.deleteFile(filePath);
    this.fileUpload = undefined;
  }
}
