import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageSelectionService } from 'src/app/shared/services/message-selection.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { UserProfileSubViewComponent } from '../users/user-profile-sub-view/user-profile-sub-view.component';
import { DrawerService } from 'src/app/shared/services/drawer.service';


/**
* Component for handling the search functionality within the application.
* This component provides a search bar for finding users, channels, and messages.
* It integrates with the SearchService for search operations and displays the results in a user-friendly manner.
*/
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
    private drawerService: DrawerService
  ) { }


  /**
  * Conducts a search based on the current search input and updates the component state with the results.
  */
  async searchData() {
    const searchResult = await this.searchService.searchUsersChannelsAndMessages(this.search, this.messageSearch)
    this.filteredUser = searchResult.filteredUser;
    this.filteredChannel = searchResult.filteredChannel;
    this.filteredMessages = searchResult.filteredMessages
  }


  onMessageSelect(messageId: string) {
    this.messageSelectionService.selectMessage(messageId);
    this.filteredMessages = [];
    if(this.drawerService.checkScreenSize() && this.drawerService.isDrawerOpen) this.drawerService.toggle();
  }


  deleteSearch() {
    this.search = '';
    this.filteredUser = [];
    this.filteredChannel = [];
    this.searchOutput = false;
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


  /**
  * Formats a timestamp into a readable date format.
  * @param {{ seconds: number; nanoseconds: number }} timestamp - The timestamp to format.
  * @returns {string} A formatted date string.
  */
  formatTimestamp(timestamp: { seconds: number; nanoseconds: number }): string {
    const date = new Date(timestamp.seconds * 1000);
    const day = date.getDate();
    const monthNames = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];
    const month = monthNames[date.getMonth()];
    return `${day}. ${month}`;
  }
}