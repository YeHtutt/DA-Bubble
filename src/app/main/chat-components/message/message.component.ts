import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';


@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {

  @Input() message: any;
  public currentUser: string | null = '';
  public checkIfEdit: boolean = false;
  public showEdit: boolean = false;
  editMessage: string = '';
  docId: string | undefined = '';
  coll: string | undefined = '';
  isOpened: boolean = false;
  

  constructor(
    private userService: UsersFirebaseService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.currentUser = this.userService.getFromLocalStorage();
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

  cancelEdit() {
    this.showEdit = !this.showEdit
  }

  deleteMessage(msgId: string) {
    this.getMessagePath();
    this.messageService.deleteMessageDoc(this.coll, this.docId, msgId)
  }


  toggleEmoji() {
    this.isOpened = !this.isOpened;
  }

  addEmoji(emoji: string) {
    const text = `${emoji}`;
    this.editMessage += text;
    this.isOpened = false;
  }
}
