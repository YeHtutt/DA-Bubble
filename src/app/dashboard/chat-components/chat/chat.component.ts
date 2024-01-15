import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { FirebaseUtilsService } from 'src/app/shared/services/firebase-utils.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';
import { ThreadService } from 'src/app/shared/services/thread.service';
import { UserProfileSubViewComponent } from '../../users/user-profile-sub-view/user-profile-sub-view.component';
import { MatDialog } from '@angular/material/dialog';
import { FileUpload } from 'src/app/models/file-upload';
import { FileStorageService } from 'src/app/shared/services/file-storage.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { MessageSelectionService } from 'src/app/shared/services/message-selection.service';
import { Subscription } from 'rxjs';


/**
 * Component for managing and displaying chat functionality.
 * This component allows users to send and view messages within a chat, including file uploads and emoji reactions.
 * It integrates with various services for user, message, and file management.
 */
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
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
export class ChatComponent {
  chatId: string = '';
  chat: any;
  text: string = '';
  message: Message = new Message();
  chatExists: boolean = false;
  currentUser: UserProfile = new UserProfile;
  public receiver: UserProfile = new UserProfile;
  filteredUsersForTag: UserProfile[] = [];
  showTagMenu: boolean = false;
  isOpened: boolean = false;
  fileUpload?: FileUpload;
  fileType: string = '';
  shiftPressed: boolean = false;
  messageSending: boolean = false;
  scrollElement: any;
  @ViewChild('scroller') scrollElementRef?: ElementRef;
  @ViewChild('endScrollElement') endScrollElement?: ElementRef;
  private observer?: IntersectionObserver;
  isElementVisible: boolean = false;
  searchMessage: boolean = false;
  messageSelectionSub: Subscription = new Subscription();
  allUsers: UserProfile[] = [];


  constructor(
    public messageService: MessageService,
    private route: ActivatedRoute,
    private userService: UsersFirebaseService,
    private firebaseUtils: FirebaseUtilsService,
    private searchService: SearchService,
    public threadService: ThreadService,
    public dialog: MatDialog,
    private fileService: FileStorageService,
    private notificationService: NotificationService,
    private messageSelectionService: MessageSelectionService
  ) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.chatExists = false;
      this.chatId = params.get('chatId') || '';
      this.getReceiverData();
      this.firebaseUtils.getDocData('chat', this.chatId).then(() => {
        this.messageService.subMessage('chat', this.chatId);
        setTimeout(() => this.scrollDown(), 500);
      }).catch(err => {
        //console.error("Error fetching channel data:", err);
      });
    });
    this.messageSelectionSub = this.messageSelectionService.selectedMessageId$.subscribe(id => { if (id) this.scrollToMessage(id) });
    this.loadUserData();
  }


  /**
   * Sets up an intersection observer for handling scroll events after the view initializes.
   */
  ngAfterViewInit() {
    this.initIntersectionObserver();
  }


  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
    if (this.messageSelectionSub) this.messageSelectionSub.unsubscribe();
  }


  /**
  * Initializes an intersection observer for detecting when an element is in the viewport.
  */
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


  /**
   * Retrieves all messages for display in the chat.
   * @returns {Message[]} An array of message objects.
   */
  getAllMessages() {
    if (this.messageService.messages.length > 0) this.chatExists = true;
    return this.messageService.messages
  }


  /**
   * TrackBy function to optimize Angular's change detection within ngFor loops.
   * @param {number} index - The index of the current item in the loop.
   * @param {any} item - The current item.
   * @returns The unique identifier for the item.
   */
  trackByFunction(index: number, item: any) {
    return item.messageId; // oder eine eindeutige Eigenschaft der Nachricht
  }


  async loadUserData() {
    this.userService.getUsers().then((users: any) => this.allUsers = users);
  }


  /**
   * Scrolls the chat to the latest message.
   */
  scrollDown() {
    this.scrollElement = this.scrollElementRef?.nativeElement;
    this.scrollElement.scrollTop = this.scrollElement.scrollHeight;
  }


  /**
   * Scrolls to a specific message in the chat.
   * @param {string} id - The ID of the message to scroll to.
   */
  scrollToMessage(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('animation-message');
      setTimeout(() => {
        element.classList.remove('animation-message');
      }, 1200);
    }
  }


  /**
   * Retrieves the receiver's data for the current chat.
   */
  async getReceiverData() {
    this.chat = await this.messageService.getDirectChatDoc(this.chatId);
    this.checkWhoReceiverIs();
    this.userService.getUser(this.checkWhoReceiverIs()).then((user: any) => { this.receiver = user });
  }


  /**
   * Determines the receiver of the chat based on the current user and chat data.
   * @returns {string} The ID of the receiver.
   */
  checkWhoReceiverIs() {
    if (this.chat.user1 == this.currentUser.id) {
      return this.chat.user2;
    } else {
      return this.chat.user1;
    }
  }


  async sendMessage() {
    let path = `chat/${this.chatId}/message`
    await this.messageService.uploadMessageWithPath(path, this.createMessageObject());
    this.text = '';
    this.fileUpload = undefined;
    this.fileType = '';
    this.messageSending = false;
    this.messageSelectionService.selectMessage('true');
    setTimeout(() => this.scrollDown(), 500);
  }


  createMessageObject() {
    return new Message({
      origin: 'chat',
      text: this.text,
      time: new Date(),
      messageId: '',
      user: this.currentUser.toJSON(),
      textEdited: false,
      type: 'message',
      reactions: [],
      fileUpload: this.fileUpload?.toJSON() || [],
      threadCount: '',
      timeOflastReply: ''
    });
  }


  /**
   * Detects keypress events and triggers message sending based on the key pressed.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  sendByKey(event: KeyboardEvent) {
    if (event.key == 'Shift') {
      this.shiftPressed = event.type === 'keydown';
    }
    if (!this.messageSending && event.key === 'Enter' && !this.shiftPressed && !this.isEmptyOrWhitespace() || this.fileType !== '') {
      this.messageSending = true;
      this.sendMessage();
    }
  }


  /**
   * Checks if the message text is empty or consists only of whitespace.
   * @returns {boolean} True if the message is empty or whitespace, false otherwise.
   */
  isEmptyOrWhitespace(): boolean {
    return this.text.replace(/\n/g, '').trim().length === 0;
  }

  
  checkForTag() {
    const atIndex = this.text.lastIndexOf('@');
    if (atIndex > 0 && this.text[atIndex - 1] === ' ' && this.text.includes('@') || atIndex === 0) {
      this.showTagMenu = true;
      const textAfterAt = this.text.substring(atIndex);
      const endOfQueryIndex = textAfterAt.indexOf(' ');
      const searchQuery = endOfQueryIndex === -1 ? textAfterAt : textAfterAt.substring(0, endOfQueryIndex);
      this.searchUserToTag(searchQuery)
    }
    if (!this.text.includes('@')) this.showTagMenu = false;
  }

  async toggleTagMenu(tag: string) {
    this.showTagMenu = !this.showTagMenu;
    this.searchUserToTag(tag);
  }

  async searchUserToTag(tag: string) {
    const searchResult = await this.searchService.searchUsersChannelsAndMessages(tag, this.searchMessage);
    this.filteredUsersForTag = searchResult.filteredUser;
  }

  tagUser(user: string) {
    const atIndex = this.text.lastIndexOf('@');
    if (atIndex !== -1) {
      this.text = this.text.substring(0, atIndex) + `@${user}`;
    } else {
      this.text = this.text + `@${user}`;
      this.showTagMenu = !this.showTagMenu;
    }
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

  openProfileDialogInSearch(node: any) {
    const userId = node.id;
    const userName = node.name;
    const userPhotoURL = node.photoURL;
    const userEmail = node.email;
    const isOnline = node.isOnline;
    this.dialog.open(UserProfileSubViewComponent, {
      width: '500px',
      height: '727px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      autoFocus: false,
      data: {
        id: userId,
        name: userName,
        photoURL: userPhotoURL,
        email: userEmail,
        isOnline: isOnline
      }
    });
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
    this.fileType = '';
  }
}