import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Channel } from 'src/app/models/channel';
import { DirectChat } from 'src/app/models/direct-chat';
import { FileUpload } from 'src/app/models/file-upload';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { MessageService } from 'src/app/services/message.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SearchService } from 'src/app/services/search.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

72
type ReceiverType = UserProfile | Channel;

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})

export class NewMessageComponent {

  text: string = '';
  message: Message = new Message()
  id: string = '';
  usersAndChannels: any = [];
  public search: string = '';
  filteredUser: any = [];
  filteredChannel: any = [];
  receiver: ReceiverType = new UserProfile;
  currentUser: UserProfile = new UserProfile;
  searchOutput: boolean = false;
  allUsers: UserProfile[] = [];
  showTagMenu: boolean = false;
  isOpened: boolean = false;
  fileUpload?: FileUpload;
  fileType: string = '';


  constructor(
    private userService: UsersFirebaseService,
    private messageService: MessageService,
    private searchService: SearchService,
    private fileService: FileStorageService,
    private notificationService: NotificationService

  ) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }

  send() {
    if (this.receiver instanceof UserProfile) {
      let origin = 'chat';
      this.messageService.sendMessage(this.createMessageObject(origin), this.receiver, true, this.createDirectChatObject(this.receiver),);
    } else {
      let origin = 'channel';
      this.messageService.sendMessage(this.createMessageObject(origin), this.receiver, true, '');
    }
    this.text = '';
    this.fileUpload = undefined;
  }

  createDirectChatObject(receiver: UserProfile): DirectChat {
    return new DirectChat({
      chatId: `${this.currentUser.id}_${receiver.id}`,
      creationTime: new Date(),
      user1: this.currentUser.id,
      user2: receiver.id,
    });
  }

  createMessageObject(origin: string) {
    return new Message({
      origin: origin,
      text: this.text,
      time: new Date(),
      messageId: '',
      user: this.currentUser.toJSON(),
      textEdited: false,
      type: 'message',
      reactions: [],
      fileUpload: this.fileUpload?.toJSON() || []
    });
  }


  async searchData() {
    const searchResult = await this.searchService.searchUsersAndChannels(this.search)
    this.filteredUser = searchResult.filteredUser;
    this.filteredChannel = searchResult.filteredChannel;
  }

  selectReceiver(receiver: any) {
    this.search = receiver.name || `# ${receiver.channelName}`;
    this.receiver = receiver;
    this.filteredChannel = [];
    this.filteredUser = [];
  }

  toggleSearchOutput() {
    this.searchOutput = !this.searchOutput;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('input') && !target.closest('.searchOutput')) {
      this.searchOutput = false;
    }
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