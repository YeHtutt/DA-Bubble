import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Channel } from 'src/app/models/channel';
import { DirectChat } from 'src/app/models/direct-chat';
import { FileUpload } from 'src/app/models/file-upload';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { FileStorageService } from 'src/app/shared/services/file-storage.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';


type ReceiverType = UserProfile | Channel;
/**
* Component for creating and sending new messages.
* This component allows users to compose and send messages to either individual users or channels.
* It integrates with various services for message creation, file uploading, and user search functionality.
*/
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
  searchMessage: boolean = false;
  shiftPressed: boolean = false;
  messageSending: boolean = false;


  constructor(
    private userService: UsersFirebaseService,
    private messageService: MessageService,
    private searchService: SearchService,
    private fileService: FileStorageService,
    private notificationService: NotificationService

  ) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }


  /**
  * Sends the composed message to the selected receiver.
  */
  send() {
    if (this.receiver instanceof UserProfile) {
      let origin = 'chat';
      this.messageService.sendMessage(this.createMessageObject(origin), this.receiver, true);
    } else {
      let origin = 'channel';
      this.messageService.sendMessage(this.createMessageObject(origin), this.receiver, true);
    }
    this.text = '';
    this.fileUpload = undefined;
  }


  /**
  * Sends the message when the 'Enter' key is pressed and certain conditions are met.
  * @param {KeyboardEvent} event - The keyboard event.
  */
  sendByKey(event: KeyboardEvent) {
    if (event.key == 'Shift') {
      this.shiftPressed = event.type === 'keydown';
    }
    if (event.key === 'Enter' && !this.shiftPressed && !this.isEmptyOrWhitespace() || this.fileType !== '' && !this.messageSending) {
      this.messageSending = true;
      this.send();
    }
  }


  /**
  * Checks if the message text is empty or contains only whitespace.
  * @returns {boolean} True if the message is empty or whitespace, false otherwise.
  */
  isEmptyOrWhitespace(): boolean {
    return this.text.replace(/\n/g, '').trim().length === 0;
  }


  /**
  * Creates a message object based on the current state.
  * @param {string} origin - The origin of the message ('chat' or 'channel').
  * @returns {Message} The created message object.
  */
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
      fileUpload: this.fileUpload?.toJSON() || [],
      threadCount: '',
      timeOflastReply: ''
    });
  }


  /**
  * Conducts a search based on the current search input and updates the component state with the results.
  */
  async searchData() {
    const searchResult = await this.searchService.searchUsersChannelsAndMessages(this.search, this.searchMessage)
    this.filteredUser = searchResult.filteredUser;
    this.filteredChannel = searchResult.filteredChannel;
  }


  /**
  * Selects a receiver for the message.
  * @param {any} receiver - The receiver object.
  */
  selectReceiver(receiver: any) {
    this.search = receiver.name || `# ${receiver.channelName}`;
    this.receiver = receiver;
    this.filteredChannel = [];
    this.filteredUser = [];
  }


  /**
  * Opens the search output area.
  * @param {Event} event - The event that triggered the opening.
  */
  openSearchOutput(event: Event) {
    event.stopPropagation();
    this.searchOutput = true;
  }

  closeSearch() {
    this.searchOutput = false;
  }


  async openTagMenu() {
    this.showTagMenu = !this.showTagMenu;
    const searchResult = await this.searchService.searchUsersChannelsAndMessages('@', this.searchMessage);
    this.allUsers = searchResult.filteredUser;
    setTimeout(() => this.showTagMenu = !this.showTagMenu, 8000);
  }


  /**
  * Inserts a tagged user into the message input.
  * @param {string} user - The username of the user to tag.
  */
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


  /**
  * Handles the file upload process for a message.
  * @param {any} event - The file upload event.
  */
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


  /**
  * Sets the file type icon based on the type of the file.
  * @param {string} type - The file type.
  */
  setFileType(type: string) {
    if (type.includes('jpeg' || 'jpg')) this.fileType = 'assets/img/icons/jpg.png';
    if (type.includes('png')) this.fileType = 'assets/img/icons/png.png';
    if (type.includes('pdf')) this.fileType = 'assets/img/icons/pdf.png';
  }


  /**
  * Deletes a file from the storage.
  * @param {string} filePath - The path of the file to delete.
  */
  onDelete(filePath: string) {
    this.fileService.deleteFile(filePath);
    this.fileUpload = undefined;
  }
}