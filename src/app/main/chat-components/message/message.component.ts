import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ThreadService } from 'src/app/services/thread.service';

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

  @Input() message: any;
  public currentUser: string;
  currentUserName: string = '';
  public checkIfEdit: boolean = false;
  public showEdit: boolean = false;
  editMessage: string = '';
  docId: string | undefined = '';
  coll: string | undefined = '';

  isOpened: boolean = false;
  isReactionInputOpened: boolean = false;
  isReactionOpened: boolean = false;

  constructor(
    private userService: UsersFirebaseService,
    private messageService: MessageService,
    private router: Router,
    public threadService: ThreadService
  ) {
    this.currentUser = this.userService.getFromLocalStorage() || '';
    this.userService.getUser(this.currentUser).then((user) => this.currentUserName = user.name);
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
    this.isReactionInputOpened = !this.isReactionInputOpened;
  }

  openInReaction() {
    this.isReactionOpened = !this.isReactionOpened;
  }


  // async addReaction(emoji: string, msgId: string) {
  //   this.getMessagePath();
  //   let reaction = this.createReactionObject(emoji, this.currentUser)
  //   const msg = await this.messageService.getMessageReactons(this.coll, this.docId, msgId);
  //   const existingReactions: { reactionEmoji: string; users: string[] }[] = msg.reactions ? [...msg.reactions] : [];
  //   const reacOfUserExists = existingReactions.findIndex((reac: Reaction) => reac.reactionEmoji === reaction.reactionEmoji && reac.users.includes(reaction.users[0]));
  //   const reactionExists = existingReactions.find((reac: Reaction) => reac.reactionEmoji === reaction.reactionEmoji);
  //   if (reacOfUserExists !== -1 && reactionExists && reactionExists.users.includes(reaction.users[0]) && reactionExists.users.length === 1) {
  //     existingReactions.splice(reacOfUserExists, 1);
  //   } else if(reacOfUserExists === -1 && !reactionExists) {
  //     existingReactions.push(reaction);
  //   } else if(reactionExists && !reactionExists.users.includes(reaction.users[0])) {
  //     reactionExists.users.push(reaction.users[0])
  //   } else if(reactionExists && reactionExists.users.includes(reaction.users[0])) {
  //     const userIndex = reactionExists.users.indexOf(reaction.users[0]);
  //     reactionExists.users.splice(userIndex, 1);
  //   }
  //   this.messageService.updateReaction(this.coll, this.docId, msgId, existingReactions);
  // }

  async updateMessageReactions(emoji: string, msgId: string) {
    this.getMessagePath();
    let reaction = this.createReactionObject(emoji, this.currentUserName);
    const existingReactions: { reactionEmoji: string; users: string[] }[] = this.message.reactions ? [...this.message.reactions] : [];
    const reacOfUserExists = existingReactions.findIndex((reac: Reaction) => reac.reactionEmoji === reaction.reactionEmoji && reac.users.includes(reaction.users[0]));
    const reactionExists = existingReactions.find((reac: Reaction) => reac.reactionEmoji === reaction.reactionEmoji);
    if (this.canDeleteReaction(reacOfUserExists, reactionExists, reaction)) {
      existingReactions.splice(reacOfUserExists, 1);
    } else if (this.canAddNewReaction(reacOfUserExists, reactionExists)) {
      existingReactions.push(reaction);
    } else if (this.canAddUserToReaction(reactionExists, reaction)) {
      reactionExists?.users.push(reaction.users[0])
    } else if (this.canDeleteUserFromReaction(reactionExists, reaction)) {
      const userIndex = reactionExists ? reactionExists.users.indexOf(reaction.users[0]) : 0;
      reactionExists?.users.splice(userIndex, 1);
    }
    this.messageService.updateReaction(this.coll, this.docId, msgId, existingReactions);
  }

  canDeleteReaction(reacOfUserExists: number, reactionExists: Reaction | undefined, reaction: Reaction) {
    return reacOfUserExists !== -1 && reactionExists && reactionExists.users.includes(reaction.users[0]) && reactionExists.users.length === 1;
  }

  canAddNewReaction(reacOfUserExists: number, reactionExists: Reaction | undefined) {
    return reacOfUserExists === -1 && !reactionExists;
  }

  canAddUserToReaction(reactionExists: Reaction | undefined, reaction: Reaction) {
    return reactionExists && !reactionExists.users.includes(reaction.users[0]);
  }

  canDeleteUserFromReaction(reactionExists: Reaction | undefined, reaction: Reaction) {
    return reactionExists && reactionExists.users.includes(reaction.users[0]);
  }

  createReactionObject(emoji: string, user: string) {
    let reaction: Reaction;
    return reaction = {
      reactionEmoji: emoji,
      users: [user]
    };
  }
}