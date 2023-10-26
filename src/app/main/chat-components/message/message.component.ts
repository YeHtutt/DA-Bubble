import { Component, Input} from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ThreadService } from 'src/app/services/thread.service';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';

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

  @Input() collPath: any;
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
    public threadService: ThreadService,
    private firebaseUtils: FirebaseUtilsService,
    private router: Router,
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

    if (this.message.type === 'message') {
      this.messageService.updateReaction(this.coll, this.docId, msgId, existingReactions);
    } else if (this.message.type === 'reply') {
      this.saveReaction(this.collPath);
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


  /* Thread(Reply) functions */

  saveReply(path: any) {
    this.message.text = this.editMessage || '';
    this.threadService.updateDoc(path, this.message, 'messageId');
  }

  saveReaction(path: any) {
    this.threadService.updateDoc(path, this.message, 'messageId');
  }

  deleteReply(path: string) {
    this.firebaseUtils.deleteCollection(path, this.message.messageId)
  }

}