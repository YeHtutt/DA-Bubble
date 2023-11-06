import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  collPath = '';
  thread: any;
  fileUploadThread?: FileUpload;
  fileTypeThread: string = '';


  constructor(
    private route: ActivatedRoute,
    public threadService: ThreadService,
    private firebaseUtils: FirebaseUtilsService,
    private searchService: SearchService,
    private userService: UsersFirebaseService,
    private fileService: FileStorageService,
    private notificationService: NotificationService
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
        this.collPath = `${message.origin}/${this.currentId}/message/${message.messageId}/thread`
        this.threadService.subReplies(this.collPath);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
      fileUpload: this.fileUploadThread?.toJSON() || []
    });
  }


  sendReplyTo() {
    this.firebaseUtils.addCollWithPath(this.collPath, 'messageId', this.createMessageObject().toJSON());
    this.text = '';
    this.fileUploadThread = undefined;
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
      if(type.includes('jpeg' || 'jpg')) this.fileTypeThread = 'assets/img/icons/jpg.png';
      if(type.includes('png')) this.fileTypeThread = 'assets/img/icons/png.png';
      if(type.includes('pdf')) this.fileTypeThread = 'assets/img/icons/pdf.png';
    }
  
    onDelete(filePath: string) {
      this.fileService.deleteFile(filePath);
      this.fileUploadThread = undefined;
    }
}
