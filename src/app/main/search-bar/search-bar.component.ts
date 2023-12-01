import { Component, HostListener, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchService } from 'src/app/services/search.service';
import { UserProfileSubViewComponent } from '../users/user-profile-sub-view/user-profile-sub-view.component';
import { MessageSelectionService } from 'src/app/services/message-selection.service';
import { Message } from 'src/app/models/message';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UserProfile } from 'src/app/models/user-profile';


@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {

  public search: string = '';
  filteredUser: any = [];
  filteredChannel: any = [];
  filteredMessages: any = [];
  usersAndChannels: any = [];
  searchOutput: boolean = false;
  @Input() isMobile: boolean = false;
  @Input() messageSearch: boolean = false;

  constructor(
    private searchService: SearchService,
    public dialog: MatDialog,
    public messageSelectionService: MessageSelectionService,
    private userService: UsersFirebaseService
  ) { }

  async searchData() {
    const searchResult = await this.searchService.searchUsersChannelsAndMessages(this.search, this.messageSearch)
    this.filteredUser = searchResult.filteredUser;
    this.filteredChannel = searchResult.filteredChannel;
    this.filteredMessages = searchResult.filteredMessages
    // this.updateUserOnMessage(searchResult.filteredMessages)
  }

  // async updateUserOnMessage(messages: []) {
  //   if (messages.length > 0) {
  //     const test = messages.map((msg: Message) => this.userService.getUser(msg.user.id).then((user: UserProfile) => msg.user.name = user.name))
  //   }
  // }

  onMessageSelect(messageId: string) {
    this.messageSelectionService.selectMessage(messageId);
  }

  deleteSearch() {
    this.search = '';
    this.filteredUser = [];
    this.filteredChannel = [];
    this.toggleSearchOutput();
  }


  toggleSearchOutput() {
    this.searchOutput = !this.searchOutput;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('input') && !target.closest('.searchOutputHeader')) {
      this.searchOutput = false;
    }
  }

  openProfileDialogInSearch(node: any) {
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

  formatTimestamp(timestamp: { seconds: number; nanoseconds: number }): string {
    const date = new Date(timestamp.seconds * 1000);
    const day = date.getDate();
    const monthNames = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];
    const month = monthNames[date.getMonth()];
    return `${day}. ${month}`;
  }

}
