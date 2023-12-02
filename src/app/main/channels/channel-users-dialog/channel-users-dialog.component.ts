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
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';



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
  filteredUsers: Observable<any[]>;
  allUsers: any = [];
  users: any[] = [];
  addedUsers: UserProfile[] = [];
  isKnownUser: boolean = false;
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  currentUserId: string | null = '';
  channelCreator = this.channel.creator

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

  async getAllUsers() {
    this.allUsers = await this.userService.getUsers();
  }


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
    this.dialogRef.close();
    this.notification.showSuccess('Channel wurde erstellt');
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


  remove(name: string): void {
    const index = this.users.findIndex((user: any) => user.name === name);
    if (index >= 0) {
      const removedUser = this.users[index]; // Capture the user before removing
      this.users.splice(index, 1);
      this.allUsers.push(removedUser);
      this.announcer.announce(`Removed ${name}`);
    }
  }


  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = event.option.value;
    this.users.push(selectedUser);
    this.userInput.nativeElement.value = '';
    this.userCtrl.setValue(null);
    this.checkKnownUsers();
    const index = this.allUsers.findIndex((user: any) => user.name === selectedUser.name);
    if (index !== -1) {
      this.allUsers.splice(index, 1);
    }
  }


  checkKnownUsers(): void {
    for (let user of this.users) {
      if (!this.allUsers.some((knownUser: any) => knownUser.name === user.name) &&
        !this.users.some((addedUser: any) => addedUser.name === user.name)) {
        this.isKnownUser = false;
        this.cdRef.detectChanges();
        return;
      }
    }
    this.isKnownUser = true;
    this.cdRef.detectChanges();
  }


  private _filter(value: any): any[] {
    if (typeof value !== 'string') {
      return [];
    }
    const filterValue = value.toLowerCase();
    return this.allUsers.filter((user: any) => user.name.toLowerCase().includes(filterValue));
  }


  closeDialog() {
    this.dialogRef.close();
  }


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

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.users.push({ name: value });
    }
    event.chipInput!.clear();
    this.checkKnownUsers();
  }

  // Function to check if a given name is part of allUsers
  isUserKnown(name: string): boolean {
    return this.allUsers.some((user: any) => user.name === name);
  }




}