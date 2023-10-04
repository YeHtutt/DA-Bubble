import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { Channel } from 'src/app/models/channel';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { ChannelService } from 'src/app/services/channel.service';
import { MessageService } from 'src/app/services/message.service';
import { SearchService } from 'src/app/services/search.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';


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


  constructor(
    private userService: UsersFirebaseService,
    private messageService: MessageService,
    private searchService: SearchService

  ) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }

  send() {
    this.messageService.sendMessage(this.createMessageObject(), this.receiver, true);
    this.text = '';
  }

  createMessageObject() {
    return new Message({
      text: this.text,
      time: new Date(),
      messageId: '',
      user: [this.currentUser]
    });
  }


  async searchData() {
    const searchResult = await this.searchService.searchUsersAndChannels(this.search)
    this.filteredUser = searchResult.filteredUser;
    this.filteredChannel = searchResult.filteredChannel;
    console.log(this.filteredChannel);
  }

  selectReceiver(receiver: any) {
    this.search = receiver.name || `# ${receiver.channelName}`;
    this.receiver = receiver;
    this.filteredChannel = [];
    this.filteredUser = [];
    // this.checkIfChatAlreadyExists();
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

  // checkIfChatAlreadyExists() {
  //   if (this.receiver instanceof UserProfile) {
  //     this.userService.checkIfSubcollectionExists(`user/${this.receiver.id}/message`);
  //     // this.router.navigateByUrl('/main/chat/' + this.receiver.id);
  //     console.log(this.receiver.id)
  //   }
  //   if (this.receiver instanceof Channel) {
  //     this.userService.checkIfSubcollectionExists(`channel/${this.receiver.channelId}/channel-message`);
  //     // this.router.navigateByUrl('/main/channel/' + this.receiver.channelId);
  //   }
  // }
}
