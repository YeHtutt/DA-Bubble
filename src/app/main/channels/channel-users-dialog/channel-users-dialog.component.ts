import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ChannelService } from 'src/app/services/channel.service';

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



  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usersService: UsersFirebaseService,
    private channelService: ChannelService) { }

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
    
    console.log(this.channel);
    debugger
    this.allUsers.forEach((user: any) => this.channel.usersData.push(user));
  }


  addUsers() {
    if (this.selectedOption === 'all') {
      this.pushAllUsersToChannel();
      console.log(this.channel);
    }

  }


}
