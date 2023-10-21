import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ThreadService } from 'src/app/services/thread.service';

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
  isReactionOpened: boolean = false;

  constructor(
    private userService: UsersFirebaseService,
    private messageService: MessageService,
    private router: Router,
    public threadService: ThreadService
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

  openReaction() {
    this.isReactionOpened = !this.isReactionOpened;
  }

  async addReaction(emoji: string, msgId: string) {
    this.getMessagePath();
    let reaction = this.createReactionObject(emoji, this.currentUser)
    // this.messageService.updateReaction(this.coll, this.docId, msgId, reaction);
    const msg = await this.messageService.getMessageReactons(this.coll, this.docId, msgId);
    // msg.reactions.forEach((rec: any, index) => {
    //   if (rec.reactionEmoji === reaction.reactionEmoji && rec.users === reaction.users) {
    //     console.log(index)
    //   }
    // });
    // const newRecArray = msg.reactions.filter((rec: any) => rec.includes(reaction))
    // const recExists: any = msg.reactions.some((rec: any) => rec.reactionEmoji === reaction.reactionEmoji && rec.users === reaction.users) 

    // console.log(newRecArray)
  }

  createReactionObject(emoji: string, user: string | null) {
    let reaction: {};
    return reaction = {
      reactionEmoji: emoji,
      users: user
    };
  }
}