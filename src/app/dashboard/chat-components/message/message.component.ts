import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';
import { FileUpload } from 'src/app/models/file-upload';
import { UserProfile } from 'src/app/models/user-profile';
import { FileStorageService } from 'src/app/shared/services/file-storage.service';
import { FirebaseUtilsService } from 'src/app/shared/services/firebase-utils.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { ThreadService } from 'src/app/shared/services/thread.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';
import { UserProfileSubViewComponent } from '../../users/user-profile-sub-view/user-profile-sub-view.component';


interface Reaction {
  reactionEmoji: string,
  users: string[]
}


/**
* Component for displaying and interacting with messages.
* This component handles message display, editing, deletion, reactions, and thread management.
* It integrates with various services for file uploading, user data management, and message operations.
*/
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})

export class MessageComponent {

  @Input() parentMessageId: any;
  @Input() collPath: any;
  @Input() message: any;
  @Input() set allUsers(value: any) {
    this.userIDSource.next(value);
  }
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
  userInput: boolean = true;
  private userIDSource = new BehaviorSubject<any>(new UserProfile());
  private userObservable = this.userIDSource.asObservable();
  subscription: Subscription = new Subscription;


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
    this.getUserForMessage();
    this.route.params.subscribe(params => {
      let channelId = params['channelId'];
      let chatId = params['chatId'];
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


  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }


  /**
  * Retrieves the user information associated with a message.
  */
  getUserForMessage() {
    this.subscription = this.userObservable.pipe(
      map(users => users.find((user: UserProfile) => user.id === this.message.user.id))
    ).subscribe({
      next: matchedUser => {
        if (matchedUser) {
          this.messageUser = matchedUser;
        }
      },
      error: error => {
        console.log('Keine User übereinstimmung gefunden');
      }
    });
  }


  /**
  * Converts a Firestore timestamp into a readable time format.
  * @param {any} timestamp - The Firestore timestamp to convert.
  * @returns {string} A readable time string.
  */
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


  /**
  * Extracts the document ID and collection path from the current URL.
  */
  getMessagePath() {
    const url = this.router.url;
    let urlParts = url.split('/');
    this.docId = urlParts.pop();
    this.coll = urlParts.pop();
  }


  /**
   * Saves the edited message to the database.
   * @param {string} msgId - The ID of the message being edited.
   */
  saveMessage(msgId: string) {
    this.messageService.updateMessage(this.coll, this.docId, msgId, this.editMessage);
    this.showEdit = !this.showEdit;
  }


  /**
  * Detects keypress events and triggers message sending or editing based on the key pressed.
  * @param {KeyboardEvent} event - The keyboard event.
  */
  sendByKey(event: KeyboardEvent) {
    if (event.key == 'Shift') {
      this.shiftPressed = event.type === 'keydown';
    }
    if (event.key === 'Enter' && !this.shiftPressed && !this.isEmptyOrWhitespace(this.editMessage) && !this.messageSending) {
      this.messageSending = true;
      this.message.type === 'message' ? this.saveMessage(this.message.messageId) : this.saveReply(this.collPath);
    }
  }


  /**
  * Checks if a given text is empty or consists only of whitespace.
  * @param {string} text - The text to check.
  * @returns {boolean} True if the text is empty or whitespace, false otherwise.
  */
  isEmptyOrWhitespace(text: string): boolean {
    return text.replace(/\n/g, '').trim().length === 0;
  }


  cancelEdit() {
    this.showEdit = !this.showEdit;
  }


  deleteMessage(msgId: string, filePath: string) {
    this.getMessagePath();
    this.messageService.deleteMessageDoc(this.coll, this.docId, msgId);
    if (filePath) this.onDelete(filePath);
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
  }


  toggleInReaction(event: Event) {
    event.stopPropagation();
    this.isReactionOpened = !this.isReactionOpened;
  }

  closeAllEmojiWindows() {
    this.isReactionInputOpened = false;
    this.isReactionOpened = false;
    this.isOpened = false;
  }


  /**
  * Updates the reactions on a message.
  * @param {string} emoji - The emoji used in the reaction.
  * @param {string} msgId - The ID of the message being reacted to.
  */
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
    this.closeAllEmojiWindows();
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
    const updatedFields = { text: this.editMessage || '', textEdited: true };
    this.threadService.updateDoc(path, this.message, 'messageId', updatedFields);
    this.messageSending = false;
    this.showEdit = !this.showEdit;
  }


  saveReaction(path: any, updateObject: any) {
    this.threadService.updateDoc(path, this.message, 'messageId', updateObject);
  }


  async deleteReply(path: string) {
    await this.firebaseUtils.deleteCollection(path, this.message.messageId);

    let parentPath = `${this.origin}/${this.currentId}/message/${this.parentMessageId}`;
    let replyPath = `${this.origin}/${this.currentId}/message/${this.parentMessageId}/thread`;

    let count = await this.threadService.fetchUpdatedCount(replyPath) as number; // Make sure this is awaited

    let timeOfLastReply;

    if (count > 0) {
      let replyDoc = await this.firebaseUtils.getColl(replyPath)
      const lastMessage = await this.messageService.getLastMessageFromSubcollection(replyDoc);
      timeOfLastReply = lastMessage ? lastMessage.time : new Date();
    } else {
      timeOfLastReply = "";
    }
    await this.messageService.updateCount(parentPath, count, timeOfLastReply);
  }


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