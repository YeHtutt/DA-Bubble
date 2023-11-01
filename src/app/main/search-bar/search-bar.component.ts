import { Component, HostListener, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchService } from 'src/app/services/search.service';
import { UserProfileSubViewComponent } from '../users/user-profile-sub-view/user-profile-sub-view.component';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {

  public search: string = '';
  filteredUser: any = [];
  filteredChannel: any = [];
  usersAndChannels: any = [];
  searchOutput: boolean = false;
  @Input() isMobile: boolean = false;

  constructor(
    private searchService: SearchService,
    public dialog: MatDialog) {}

  async searchData() {
    const searchResult = await this.searchService.searchUsersAndChannels(this.search)
    this.filteredUser = searchResult.filteredUser;
    this.filteredChannel = searchResult.filteredChannel;
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

}
