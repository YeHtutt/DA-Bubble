import { Component, Inject, HostListener, } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ChannelService } from 'src/app/services/channel.service';
import { SearchService } from 'src/app/services/search.service';


@Component({
  selector: 'app-channel-users-dialog',
  templateUrl: './channel-users-dialog.component.html',
  styleUrls: ['./channel-users-dialog.component.scss']
})
export class ChannelUsersDialogComponent {

  channel = this.data.channel;
  selectedOption: string | undefined;
  inputOpened = false;
  allUsers: any;
  public search: string = '';
  filteredUser: any = [];
  searchOutput: boolean = false;



  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usersService: UsersFirebaseService,
    private channelService: ChannelService,
    private searchService: SearchService,
    ) { }

  ngOnInit() {
    console.log(this.channel);
    this.getAllUsers();
  }

  openUsernameInput() {
    this.inputOpened = this.selectedOption === 'individual';
  }

  async getAllUsers() {
    this.allUsers = await this.usersService.getUsers();
    console.log(this.allUsers);
  }

  pushAllUsersToChannel() {
    this.allUsers.forEach((user: any) => this.channel.usersData.push(user));
  }


  addUsers() {
    if (this.selectedOption === 'all') {
      this.pushAllUsersToChannel();
      console.log(this.channel);
    }
  }


  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('input') && !target.closest('.searchOutputHeader')) {
      this.searchOutput = false;
    }
  }

  async searchData() {
    const searchResult = await this.searchService.searchUsersAndChannels(this.search)
    this.filteredUser = searchResult.filteredUser;
  }

  toggleSearchOutput() {
    this.searchOutput = !this.searchOutput;
  }

  openProfile(user: any) {console.log(user);}

}
