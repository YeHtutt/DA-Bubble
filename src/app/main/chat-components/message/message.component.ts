import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FileUpload } from 'src/app/models/file-upload';
import { UserProfile } from 'src/app/models/user-profile';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { MessageService } from 'src/app/services/message.service';
import { ThreadService } from 'src/app/services/thread.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UserProfileSubViewComponent } from '../../users/user-profile-sub-view/user-profile-sub-view.component';


interface Reaction {
  reactionEmoji: string,
  users: string[]
}

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})

export class MessageComponent {

  @Input() parentMessageId: any;
  @Input() collPath: any;
  @Input() message: any;
  @Output() messageLoaded = new EventEmitter<boolean>();
  public currentUser: string;
  public checkIfEdit: boolean = false;
  public showEdit: boolean = false;
  currentUserName: string = '';
  editMessage: string = '';
  docId: string | undefined = '';
  coll: string | undefined = '';
  origin: string = '';
  isOpened: boolean = false;
  isReactionInputOpened: boolean = false;
  isReactionOpened: boolean = false;
  isPDF: boolean = false;
  imageFile?: FileUpload;
  pdfFile?: FileUpload;
  shiftPressed: boolean = false;
  messageSending: boolean = false;
  currentId: string = '';
  messageUser?: UserProfile;
  users$: Observable<UserProfile[]> = new Observable;
  usersSub: Subscription = new Subscription();
  


  constructor(
    public userService: UsersFirebaseService,
    private messageService: MessageService,
    public threadService: ThreadService,
    private router: Router,
    private fileService: FileStorageService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private firebaseUtils: FirebaseUtilsService
  ) {
    this.currentUser = this.userService.getFromLocalStorage() || '';
    this.userService.getUser(this.currentUser).then((user) => this.currentUserName = user.name);
  }


  ngOnInit() {
    this.getPDFurl();
    this.route.params.subscribe(params => {
      let channelId = params['channelId'];
      let chatId = params['chatId'];
      this.loadUserData();
      if (channelId) {
        this.currentId = channelId;
        this.origin = 'channel'
      }
      else if (chatId) {
        this.currentId = chatId;
        this.origin = 'chat'
      }
    });
  }


  ngAfterViewInit() {
    this.messageLoaded.emit(true);
  }


  loadUserData() {
    this.users$ = this.userService.getAllUserData();
    this.usersSub = this.users$.subscribe((users: any[]) => this.getUserForMessage(users));
  }


  getUserForMessage(users: any[]) {
    users.forEach((user: UserProfile) => {
      if(this.message.user.id === user.id) this.messageUser = user;
    })
  }


  getTimeOfDate(timestamp: any) {
    const date = new Date(timestamp.seconds * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formattedTime;
  }


  openMenu() {
    this.checkIfEdit = !this.checkIfEdit;
    setTimeout(() => this.checkIfEdit = !this.checkIfEdit, 5000);
  }


  openEdit(messageText: string) {
    this.showEdit = !this.showEdit
    this.editMessage = messageText;
    this.getMessagePath();
  }


  getMessagePath() {
    const url = this.router.url;
    let urlParts = url.split('/');
    this.docId = urlParts.pop();
    this.coll = urlParts.pop();
  }


  saveMessage(msgId: string) {
    this.messageService.updateMessage(this.coll, this.docId, msgId, this.editMessage);
  }


  sendByKey(event: KeyboardEvent) {
    if (event.key == 'Shift') {
      this.shiftPressed = event.type === 'keydown';
    }
    if (event.key === 'Enter' && !this.shiftPressed && !this.isEmptyOrWhitespace(this.editMessage) && !this.messageSending) {
      this.messageSending = true;
      this.saveMessage(this.message.messageId);
    }
  }


  isEmptyOrWhitespace(text: string): boolean {
    return text.replace(/\n/g, '').trim().length === 0;
  }


  cancelEdit() {
    this.showEdit = !this.showEdit;
  }


  deleteMessage(msgId: string, filePath: string) {
    this.getMessagePath();
    this.messageService.deleteMessageDoc(this.coll, this.docId, msgId);
    if(filePath) this.onDelete(filePath);
  }


  toggleEmoji(event: Event) {
    event.stopPropagation();
    this.isOpened = !this.isOpened;
  }


  addEmoji(emoji: string) {
    const text = `${emoji}`;
    this.editMessage += text;
    this.isOpened = false;
  }


  toggleReaction(event: Event) {
    event.stopPropagation();
    this.isReactionInputOpened = !this.isReactionInputOpened;
    // setTimeout(() => this.isReactionInputOpened = !this.isReactionInputOpened, 8000);
  }


  toggleInReaction(event: Event) {
    event.stopPropagation();
    this.isReactionOpened = !this.isReactionOpened;
  }


  async updateMessageReactions(emoji: string, msgId: string) {

    this.getMessagePath();
    const reaction = this.createReactionObject(emoji);
    const existingReactions = this.message.reactions || [];
    const userReactionIndex = existingReactions.findIndex((r: any) => r.reactionEmoji === emoji && r.users.includes(this.currentUserName));
    const existingReaction = existingReactions.find((r: any) => r.reactionEmoji === emoji);

    if (this.canDeleteReaction(userReactionIndex, existingReaction)) {
      existingReactions.splice(userReactionIndex, 1);
    } else if (this.canAddNewReaction(userReactionIndex, existingReaction)) {
      existingReactions.push(reaction);
    } else if (this.canAddUserToReaction(existingReaction)) {
      existingReaction?.users.push(this.currentUserName);
    } else if (this.canRemoveUserFromReaction(existingReaction)) {
      const userIndex = existingReaction.users.indexOf(this.currentUserName);
      existingReaction?.users.splice(userIndex, 1);
    }
    const updateObject = { reactions: existingReactions };
    if (this.message.type === 'message') {
      this.messageService.updateReaction(this.coll, this.docId, msgId, existingReactions);
    } else if (this.message.type === 'reply') {
      this.saveReaction(this.collPath, updateObject);
    }
  }


  canDeleteReaction(index: number, reaction: Reaction | undefined) {
    return index !== -1 && reaction?.users.length === 1;
  }


  canAddNewReaction(index: number, reaction: Reaction | undefined) {
    return index === -1 && !reaction;
  }


  canAddUserToReaction(reaction: Reaction | undefined) {
    return reaction && !reaction.users.includes(this.currentUserName);
  }


  canRemoveUserFromReaction(reaction: Reaction | undefined) {
    return reaction && reaction.users.includes(this.currentUserName);
  }


  createReactionObject(emoji: string) {
    return {
      reactionEmoji: emoji,
      users: [this.currentUserName]
    };
  }


  getHighestReactions() {
    const sortedReactions = this.message.reactions.sort((a: any, b: any) => b.users.length - a.users.length);
    return sortedReactions;
  }


  onOutsideClick(reaction: string): void {
    if (reaction == 'isReactionOpened') this.isReactionOpened = false;
    if (reaction == 'isReactionInputOpened') this.isReactionInputOpened = false;
    if (reaction == 'isOpened') this.isOpened = false;
  }


  /* Thread(Reply) functions */

  saveReply(path: any) {
    const updatedFields = { text: this.editMessage || '' };
    this.threadService.updateDoc(path, this.message, 'messageId', updatedFields);
  }


  saveReaction(path: any, updateObject: any) {
    this.threadService.updateDoc(path, this.message, 'messageId', updateObject);
  }


  async deleteReply(path: string) {
    await this.firebaseUtils.deleteCollection(path, this.message.messageId);
    let replyPath = `${this.origin}/${this.currentId}/${this.parentMessageId}`;
    let newTime = this.firebaseUtils.getColl(replyPath);
    let time = new Date();
   /*  this.messageService.updateCount(replyPath, this.threadService.replyCount); */
  }

  // UPLOADED FILES

  async getPDFurl() {
    if (this.message.fileUpload && this.message.fileUpload.name) {
      if (this.message.fileUpload.name.includes('pdf')) {
        this.isPDF = true;
        this.pdfFile = this.message.fileUpload;
      } else {
        this.imageFile = this.message.fileUpload;
      }
    }
  }


  onDelete(filePath: string) {
    this.fileService.deleteFile(filePath);
  }

  // SCSS CLASS CHECKUP FUNKTIONS

  getStyles(condition: string) {
    const value = condition === 'channel' || condition === '';
    return {
      left: value ? 'auto' : null,
      right: value ? 0 : null
    }
  }


  messageClasses(message: any) {
    return {
      'message-reverse': this.isUserAuthor(message),
      'message-channel-current-user': this.isChannelMessageFromCurrentUser(message)
    };
  }


  isUserAuthor(message: any) {
    return message.user.id === this.currentUser && message.origin === 'chat';
  }


  isChannelMessageFromCurrentUser(message: any) {
    return message.user.id === this.currentUser && message.origin === 'channel';
  }

  // OPEN USER PROFIL

  openProfileDialog(node: any) {
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
}