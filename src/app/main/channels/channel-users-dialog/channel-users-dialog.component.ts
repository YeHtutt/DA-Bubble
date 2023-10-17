import { Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { ChannelService } from 'src/app/services/channel.service';
import { SearchService } from 'src/app/services/search.service';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { UserProfile } from 'src/app/models/user-profile';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-channel-users-dialog',
  templateUrl: './channel-users-dialog.component.html',
  styleUrls: ['./channel-users-dialog.component.scss'],
})
export class ChannelUsersDialogComponent {

  channel = this.data.channel;
  selectedOption: string | undefined;
  inputOpened = false;
  public search: string = '';
  searchOutput: boolean = false;
  text: string = '';
  showTagMenu: boolean = false;
  addedUsers: UserProfile[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  userCtrl = new FormControl('');
  filteredUsers: Observable<any[]>;
  allUsers: any = [];
  users: any[] = [];
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;



  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usersService: UsersFirebaseService,
    private firebaseUtils: FirebaseUtilsService,
    private dialogRef: MatDialogRef<ChannelUsersDialogComponent>,
    private announcer: LiveAnnouncer,
  ) {

    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(null),
      map((user: string | null) => (user ? this._filter(user) : this.allUsers.slice())),
    );

  }

  ngOnInit() {
    this.getAllUsers();
  }

  openUsernameInput() {
    this.inputOpened = this.selectedOption === 'individual';
  }

  addUsers() {
    if (this.selectedOption === 'all') {
      this.pushAllUsersToChannel();
      this.firebaseUtils.addColl(this.channel, 'channel', 'channelId');
    }
    if (this.selectedOption === 'individual') {

    }
  }

  async getAllUsers() {
    this.allUsers = await this.usersService.getUsers();
    console.log(this.allUsers)
  }

  pushCertainUsersToChannel() {

  }

  pushAllUsersToChannel() {
    this.allUsers.forEach((user: any) => {
      const userObject = user instanceof UserProfile ? user.toJSON() : user;
      this.channel.usersData.push(userObject);
    });
  }

  remove(name: string): void {
    const index = this.users.findIndex((user: any) => user.name === name);
    if (index >= 0) {
      this.users.splice(index, 1);
      this.announcer.announce(`Removed ${name}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = event.option.value;
    // Check if the user is part of the allUsers array before adding
    if (this.allUsers.some((user: any) => user.name === selectedUser.name)) {
      this.users.push(selectedUser);
      this.userInput.nativeElement.value = '';
      this.userCtrl.setValue(null);

      // Remove the selected user from the allUsers array
      const index = this.allUsers.findIndex((user: any) => user.name === selectedUser.name);
      if (index !== -1) {
        this.allUsers.splice(index, 1);
      }
    }
  }

  private _filter(value: any): any[] {
    if (typeof value !== 'string') {
      return [];
    }
    const filterValue = value.toLowerCase();
    return this.allUsers.filter((user: any) => user.name.toLowerCase().includes(filterValue));
  }

  openProfile(user: any) { console.log(user); }


  closeDialog() {
    this.dialogRef.close();
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) {
      this.users.push(value);
      console.log(this.users)
    }
    // Clear the input value
    event.chipInput!.clear();
  }
}