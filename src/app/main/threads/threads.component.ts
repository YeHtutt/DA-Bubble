import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThreadService } from 'src/app/services/thread.service';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { UserProfile } from 'src/app/models/user-profile';
import { Message } from 'src/app/models/message';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { NotificationService } from 'src/app/services/notification.service';
import { FileUpload } from 'src/app/models/file-upload';
import { DrawerService } from 'src/app/services/drawer.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent {
  @Output() replyCountUpdated = new EventEmitter<number>();
  private subscriptions = new Subscription();
  allUsers: UserProfile[] = [];
  currentUser: UserProfile = new UserProfile;

  currentId: string = '';
  messageCreator: any;
  message: any;
  text: string = '';
  collPath = '';
  parentMessageId: string = '';
  thread: any;

  fileUploadThread?: FileUpload;
  fileTypeThread: string = '';
  imageFile?: FileUpload;
  pdfFile?: FileUpload;

  isOpened: boolean = false;
  isPDF: boolean = false;
  showTagMenu: boolean = false;
  shiftPressed: boolean = false;
  messageSending: boolean = false;
  scrollElement: any;
  @ViewChild('scroller') scrollElementRef?: ElementRef;
  @ViewChild('endScrollElement') endScrollElement?: ElementRef;
  private observer?: IntersectionObserver;
  isElementVisible: boolean = false;



  constructor(
    private route: ActivatedRoute,
    public threadService: ThreadService,
    private firebaseUtils: FirebaseUtilsService,
    private searchService: SearchService,
    private userService: UsersFirebaseService,
    private fileService: FileStorageService,
    private notificationService: NotificationService,
    public drawerService: DrawerService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
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
        this.parentMessageId = this.message.messageId
        this.getPDFurl(message);
        this.collPath = `${message.origin}/${this.currentId}/message/${message.messageId}/thread`
        this.threadService.subReplies(this.collPath);
      })
    );

  }

  ngAfterViewInit() {
    this.initIntersectionObserver();
  }

  ngOnDestroy(): void  {
    if (this.observer) this.observer.disconnect();
    this.subscriptions.unsubscribe();
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


  getTimeOfDate(timestamp: any) {
    const date = new Date(timestamp.seconds * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formattedTime;
  }


  async openTagMenu(tag: string) {
    this.showTagMenu = true;
    const searchResult = await this.searchService.searchUsersAndChannels(tag, '');
    this.allUsers = searchResult.filteredUser;
  }

  tagUser(user: string) {
    this.text = `@${user}`;
    this.showTagMenu = !this.showTagMenu;
  }

  checkForTag() {
    const atIndex = this.text.lastIndexOf('@');
    if (atIndex > 0 && this.text[atIndex - 1] === ' ' || atIndex === 0) {
      const textAfterAt = this.text.substring(atIndex);
      const endOfQueryIndex = textAfterAt.indexOf(' ');
      const searchQuery = endOfQueryIndex === -1 ? textAfterAt : textAfterAt.substring(0, endOfQueryIndex);
      this.openTagMenu(searchQuery)
    }
    if(!this.text.includes('@')) this.showTagMenu = false;
  }

  closeTagMenu() {
    this.showTagMenu = false;
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

  closeEmojiMenu(): void {
    this.isOpened = false
  }

  getAllReplies() {
    return this.threadService.replies
  }

  createMessageObject() {
    return new Message({
      text: this.text,
      time: new Date(),
      messageId: '',
      user: this.currentUser.toJSON(),
      textEdited: false,
      type: 'reply',
      origin: '',
      reactions: [],
      fileUpload: this.fileUploadThread?.toJSON() || [],
      threadCount: '',
    });
  }


  sendReplyTo() {
    // Step 1: Add the new message.
    this.firebaseUtils.addCollWithPath(this.collPath, 'messageId', this.createMessageObject().toJSON())
      .then(() => {
        // The message has been sent, we can stop any sending indicators.
        this.messageSending = false;

        // Step 3: Manually fetch the updated count of messages/replies.
        return this.threadService.fetchUpdatedCount(this.collPath);
      })
      .then((newCount: any) => {
        // Step 4: Update the UI with the new count.
        let path = `${this.message.origin}, ${this.currentId}, ${this.message.messageId}`
        this.messageService.updateCount(path, newCount);
      })
      .catch(error => {
        console.error("Error sending reply: ", error);
      });

    // Reset the message input.
    this.text = '';
    this.fileUploadThread = undefined;
  }






  sendByKey(event: KeyboardEvent) {
    if (event.key == 'Shift') {
      this.shiftPressed = event.type === 'keydown';
    }
    if (event.key === 'Enter' && !this.shiftPressed && !this.isEmptyOrWhitespace() && !this.messageSending) {
      this.messageSending = true;
      this.sendReplyTo();
    }
  }


  isEmptyOrWhitespace(): boolean {
    return this.text.replace(/\n/g, '').trim().length === 0;
  }

  // UPLOADED FILES

  async getPDFurl(message: any) {
    if (message.fileUpload && message.fileUpload.name) {
      if (message.fileUpload.name.includes('pdf')) {
        this.imageFile = undefined;
        this.isPDF = true;
        this.pdfFile = message.fileUpload;
      } else {
        this.pdfFile = undefined;
        this.isPDF = false;
        this.imageFile = message.fileUpload;
      }
    }
  }


  // Upload File

  onUploadThread(event: any) {
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
      this.fileService.uploadFile(file).then(file => this.fileUploadThread = file);
    }
  }

  setFileType(type: string) {
    if (type.includes('jpeg' || 'jpg')) this.fileTypeThread = 'assets/img/icons/jpg.png';
    if (type.includes('png')) this.fileTypeThread = 'assets/img/icons/png.png';
    if (type.includes('pdf')) this.fileTypeThread = 'assets/img/icons/pdf.png';
  }

  onDelete(filePath: string) {
    this.fileService.deleteFile(filePath);
    this.fileUploadThread = undefined;
  }
}
