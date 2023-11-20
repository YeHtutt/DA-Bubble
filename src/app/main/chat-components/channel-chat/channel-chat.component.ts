import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AddPeopleDialogComponent } from '../../channels/add-people-dialog/add-people-dialog.component';
import { ChannelMenuComponent } from '../../channels/channel-menu/channel-menu.component';
/* Models */

import { Channel } from 'src/app/models/channel';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';

/* Services */

import { FileUpload } from 'src/app/models/file-upload';
import { ChannelService } from 'src/app/services/channel.service';
import { DrawerService } from 'src/app/services/drawer.service';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { MessageService } from 'src/app/services/message.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SearchService } from 'src/app/services/search.service';
import { ThreadService } from 'src/app/services/thread.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';


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
  shiftPressed: boolean = false;
  messageSending: boolean = false;
  @ViewChild('scroller') scrollElementRef?: ElementRef;
  @ViewChild('endScrollElement') endScrollElement?: ElementRef;
  private observer?: IntersectionObserver;
  isElementVisible: boolean = false;


  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private userService: UsersFirebaseService,
    private firebaseUtils: FirebaseUtilsService,
    private searchService: SearchService,
    public messageService: MessageService,
    private channelService: ChannelService,
    public threadService: ThreadService,
    private fileService: FileStorageService,
    private notificationService: NotificationService,
    public drawerService: DrawerService
  ) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }

  replyPath: any = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.channelId = params.get('channelId');
      this.firebaseUtils.getDocData('channel', this.channelId).then(channelData => {
        this.channel = channelData;
        this.messageService.subMessage('channel', this.channelId);
        this.channelService.unsubChannel = this.channelService.subChannelContent(this.channelId, channelData => {
          this.channel = channelData;
        });
      }).catch(err => {
        console.error("Error fetching channel data:", err);
      });
    });
  }

  ngAfterViewInit() {
    this.initIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }

  initIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isElementVisible = entry.isIntersecting;
      });
    }, { threshold: 1 });
    if (this.endScrollElement) {
      this.observer.observe(this.endScrollElement?.nativeElement);
    }
  }


  scrollDown() {
    this.scrollElement = this.scrollElementRef?.nativeElement;
    this.scrollElement.scrollTop = this.scrollElement.scrollHeight;
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



  sendByKey(event: KeyboardEvent) {
    if (event.key == 'Shift') {
      this.shiftPressed = event.type === 'keydown';
    }
    if (event.key === 'Enter' && !this.shiftPressed && !this.isEmptyOrWhitespace() && !this.messageSending) {
      this.messageSending = true;
      this.sendMessageTo(this.channelId);
    }
  }


  isEmptyOrWhitespace(): boolean {
    return this.text.replace(/\n/g, '').trim().length === 0;
  }


  sendMessageTo(docId: string) {
    this.createMessageObject().then(async createdMessage => {
      this.message = createdMessage;
      this.receiver = await this.channelService.getSingleChannel(docId);
      this.messageService.sendMessage(this.message, this.receiver, false, '');
      this.text = '';
      this.fileUpload = undefined;
      this.messageSending = false;
    });
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
      fileUpload: this.fileUpload?.toJSON() || [],
      threadCount: ''
    });
  }


  getCreatorId() {
    return this.userService.getFromLocalStorage();
  }

  checkForTag() {
    if(this.text.includes('@')) console.log('@ wurde genutzt')
  }

  async openTagMenu() {
    this.showTagMenu = !this.showTagMenu;
    const searchResult = await this.searchService.searchUsersAndChannels('@', '');
    this.allUsers = searchResult.filteredUser;
    setTimeout(() => this.showTagMenu = false, 8000);
  }

  tagUser(user: string) {
    this.text = `@${user}`;
    this.showTagMenu = !this.showTagMenu;
  }


  toggleEmoji(event: Event) {
    event.stopPropagation();
    this.isOpened = !this.isOpened;
  }

  addEmoji(emoji: string) {
    const text = `${emoji}`;
    this.text += text;
    this.isOpened = false;
  }

  onOutsideClick(): void {
    this.isOpened = false
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