import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UserProfile } from 'src/app/models/user-profile';
import { FirebaseUtilsService } from 'src/app/shared/services/firebase-utils.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';


/**
* Component for managing users in a channel.
* Allows for the addition of users to a newly created channel, either individually or by adding all users.
*/
@Component({
  selector: 'app-channel-users-dialog',
  templateUrl: './channel-users-dialog.component.html',
  styleUrls: ['./channel-users-dialog.component.scss'],
})
export class ChannelUsersDialogComponent {

  channel = this.data.channel;
  selectedOption: string | undefined;
  inputOpened = false;
  text: string = '';
  separatorKeysCodes: number[] = [ENTER, COMMA];
  userCtrl = new FormControl('');
  addedUsers: UserProfile[] = [];
  isKnownUser: boolean = false;
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  currentUserId: string | null = '';
  channelCreator = this.channel.creator
  allUsers: any = [];
  users: any[] = [];
  filteredUsers: Observable<any[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UsersFirebaseService,
    private firebaseUtils: FirebaseUtilsService,
    private dialogRef: MatDialogRef<ChannelUsersDialogComponent>,
    private announcer: LiveAnnouncer,
    private cdRef: ChangeDetectorRef,
    private notification: NotificationService,

  ) {
    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(null),
      map((user: string | null) => {
        let usersToShow = this.allUsers.filter((u: any) => u.id !== this.channelCreator.id);
        return user ? this._filter(user) : usersToShow;
      }),
    );
  }


  ngOnInit() {
    this.getAllUsers();
  }


  openUsernameInput() {
    this.inputOpened = this.selectedOption === 'individual';
  }


  closeAddPeopleDialog() {
    this.dialogRef.close();
  }

  /**
  * Determines if the 'Create' button should be disabled based on the users in the channel.
  * @returns {boolean} True if the button should be disabled, false otherwise.
  */
  shouldDisableCreateButton(): boolean {
    const isUserListEmpty = this.users.length === 0;
    const isAllSelected = this.selectedOption === 'all';

    if (isAllSelected) {
      return false;
    }

    return isUserListEmpty;
  }


  /**
  * Fetches all users from the user service.
  */
  async getAllUsers() {
    this.allUsers = await this.userService.getUsers();
  }


  /**
  * Handler for radio button changes.
  */
  onRadioChange(): void {
    if (this.selectedOption === 'all') {
      while (this.users.length > 0) {
        this.remove(this.users[0].name);
      }
      this.isKnownUser = true;
    } else {
      this.isKnownUser = false;
    }
    this.openUsernameInput();
    this.cdRef.detectChanges();
  }


  addUsers() {
    if (this.selectedOption === 'all') {
      this.pushAllUsersToChannel();
      this.firebaseUtils.addColl(this.channel, 'channel', 'channelId');
    };
    if (this.selectedOption === 'individual') {
      this.pushCertainUsersToChannel();
      this.channel.usersData.push(this.channelCreator instanceof UserProfile ? this.channelCreator.toJSON() : this.channelCreator);
      this.firebaseUtils.addColl(this.channel, 'channel', 'channelId');
    };
    this.notification.showSuccess('Channel wurde erstellt');
    this.closeDialog();
  }


  pushAllUsersToChannel() {
    this.allUsers.forEach((user: any) => {
      const userObject = user instanceof UserProfile ? user.toJSON() : user;
      this.channel.usersData.push(userObject);
    });
  }


  pushCertainUsersToChannel() {
    this.users.forEach((user: any) => {
      const userObject = user instanceof UserProfile ? user.toJSON() : user;
      this.channel.usersData.push(userObject);
    });
  }

  /**
  * Removes a user from the selected users list.
  * @param {string} name - The name of the user to remove.
  */
  remove(name: string): void {
    const index = this.users.findIndex((user: any) => user.name === name);
    if (index >= 0) {
      const removedUser = this.users[index]; // Capture the user before removing
      this.users.splice(index, 1);

      // Re-add the removed user to the allUsers array
      if (!this.allUsers.some((u: any) => u.id === removedUser.id)) {
        this.allUsers.push(removedUser);
      }

      this.announcer.announce(`Removed ${name}`);
      this.updateFilteredUsers(); // Update the filtered users list
    }
  }


  /**
  * Handler for selecting a user from the autocomplete list.
  * @param {MatAutocompleteSelectedEvent} event - The selection event.
  */
  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = event.option.value;

    // Check if the user is already added
    if (!this.users.some(u => u.id === selectedUser.id)) {
      this.users.push(selectedUser);
      this.userInput.nativeElement.value = '';
      this.userCtrl.setValue(null);
      // Remove the user from allUsers
      this.allUsers = this.allUsers.filter((u: any) => u.id !== selectedUser.id);
    }
    this.updateFilteredUsers();
  }


  closeDialog() {
    this.dialogRef.close();
  }


  /**
  * Validates the user input for adding users.
  */
  validateInput(): void {
    const inputValue = this.userCtrl.value?.trim();
    if (!inputValue) {
      this.isKnownUser = true;
      this.cdRef.detectChanges();
      return;
    }
    this.isKnownUser = this.allUsers.some((user: any) => user.name === inputValue);
    this.cdRef.detectChanges();
  }


  /**
  * Adds a user to the selected users list based on input event.
  * @param {MatChipInputEvent} event - The chip input event.
  */
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Finding the user object from allUsers
    const userToAdd = this.allUsers.find((u: any) => u.name === value);
    if (userToAdd && !this.users.some(u => u.id === userToAdd.id)) {
      this.users.push(userToAdd);
      // Update allUsers to remove the added user
      this.allUsers = this.allUsers.filter((u: any) => u.id !== userToAdd.id);
      this.updateFilteredUsers();
    }
    event.chipInput!.clear();
  }


  /**
  * Updates the list of filtered users based on the current selection.
  */
  private updateFilteredUsers(): void {
    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(''),
      map((user: string | null) => {
        let usersToShow = this.allUsers.filter((u: any) => u.id !== this.channelCreator.id);
        return user ? this._filter(user) : usersToShow;
      }),
    );
  }


  /**
  * Filters the list of all users based on the given value.
  * @param {any} value - The value to filter the users by.
  * @returns {any[]} A filtered array of users.
  */
  private _filter(value: any): any[] {
    const filterValue = value.name.toLowerCase();
    // Filter out users that have already been added
    return this.allUsers.filter((user: any) => user.name.toLowerCase().includes(filterValue) && !this.users.some(u => u.id === user.id));
  }


}