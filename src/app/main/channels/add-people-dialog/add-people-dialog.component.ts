import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { Channel } from 'src/app/models/channel';
import { UserProfile } from 'src/app/models/user-profile';
import { ChannelService } from 'src/app/services/channel.service';
import { DrawerService } from 'src/app/services/drawer.service';
import { FirebaseUtilsService } from 'src/app/services/firebase-utils.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';


@Component({
  selector: 'app-add-people-dialog',
  templateUrl: './add-people-dialog.component.html',
  styleUrls: ['./add-people-dialog.component.scss']
})
export class AddPeopleDialogComponent {

  private usersNotInChannelSubject: BehaviorSubject<UserProfile[]> = new BehaviorSubject<UserProfile[]>([]);
  channel: Channel = new Channel(this.data.channel);
  openingInChat = this.data.openingInChat;
  selectedOption: string | undefined;
  inputOpened = false;
  public search: string = '';
  searchOutput: boolean = false;
  text: string = '';
  showTagMenu: boolean = false;
  addedUsers: UserProfile[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  userCtrl = new FormControl('');
  allUsers: any = [];
  users: any[] = [];
  isKnownUser: boolean = false;
  usersNotInChannel: UserProfile[] = [];
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  filteredUsers: Observable<any[]>;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usersService: UsersFirebaseService,
    private dialogRef: MatDialogRef<AddPeopleDialogComponent>,
    private announcer: LiveAnnouncer,
    private cdRef: ChangeDetectorRef,
    private channelService: ChannelService,
    private notificationsService: NotificationService,
    public drawerService: DrawerService
  ) {
    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(''),
      map((user: string | null) => this._filter(user))
    );
  }


  ngOnInit() {
    this.getAllUsers().then(() => {
      this.getUsersNotInChannel();
    });
    this.drawerService.checkMobileMode(window.innerWidth);
  }

  async getAllUsers() {
    this.allUsers = await this.usersService.getUsers();
    this.updateUsersNotInChannel();
  }


  async getUsersNotInChannel() {
    this.allUsers = await this.usersService.getUsers();
    this.usersNotInChannel = this.filterUsersNotInChannel();
    this.usersNotInChannelSubject.next(this.usersNotInChannel);
    if (this.usersNotInChannel.length === 0) this.userCtrl.disable();
    else this.userCtrl.enable();
  }


  filterUsersNotInChannel() {
    let usersInChannel = this.channel.usersData.map((user: any) => UserProfile.fromJSON(user));
    return this.allUsers.filter((oneUser: any) =>
      !usersInChannel.some((channelUser: any) => oneUser.email === channelUser.email)
    );
  }


  closeDialog() {
    this.dialogRef.close();
  }

  closeAddPeopleDialog() {
    if (!this.openingInChat) {
      const dialogContainer = document.querySelector('.top-left-right-dialog');
      if (dialogContainer) {
        dialogContainer.classList.add('closing');

        setTimeout(() => {
          this.dialogRef.close(); // Close the dialog after the animation
        }, 500); // This duration should match your CSS animation duration
      }
    }
    if (this.openingInChat) {
      this.dialogRef.close();
    }
  }


  addUsers() {
    this.channel.usersData.push(...this.users);
    this.updateUsersNotInChannel();
    this.channelService.updateChannel(this.channel);
    let names: any = []; // Initialize `names` as an empty array
    this.users.forEach((user) => {
      names.push(user.name); // Now you can push items into `names`
    });
    this.notificationsService.showSuccess(`${names.join(', ')} erfolgreich hinzugefügt`); // Use `names` here, not `this.users`
    this.dialogRef.close();
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
      this.users.splice(index, 1);
      this.updateUsersNotInChannel();
      this.announcer.announce(`Removed ${name}`);
    }
  }


  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = event.option.value;
  
    // Check if the user is already added to the users array
    if (!this.users.some(u => u.id === selectedUser.id)) {
      this.users.push(selectedUser);
      this.userInput.nativeElement.value = '';
      this.userCtrl.setValue('');
      this.updateUsersNotInChannel(); // Update the list of users not in the channel
    }
  }
  
  private refreshUserControl(): void {
    // Triggering a null value change to refresh the filteredUsers Observable
    this.userCtrl.setValue('');
  }


  updateUsersNotInChannel() {
    // Assuming channel.usersData contains the list of users in the channel
    let usersInChannelIds = new Set(this.channel.usersData.map((user: any) => user.id));
    this.usersNotInChannel = this.allUsers.filter((user: any) => !usersInChannelIds.has(user.id));

    // Refresh the filteredUsers Observable
    this.refreshFilteredUsers();
  }

  private refreshFilteredUsers(): void {
    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(''),
      map((user: string | null) => this._filter(user))
    );
  }


  checkKnownUsers(): void {
    for (let user of this.users) {
      if (!this.usersNotInChannel.some((knownUser: any) => knownUser.name === user.name) &&
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
    const filterValue = value.name ? value.name.toLowerCase() : '';
    return this.usersNotInChannel.filter(user => user.name.toLowerCase().includes(filterValue));
  }

  validateInput(): void {
    const inputValue = this.userCtrl.value?.trim();
    if (!inputValue) {
      this.isKnownUser = true;
      this.cdRef.detectChanges();
      return;
    }
    this.isKnownUser = this.usersNotInChannel.some((user: any) => user.name === inputValue);
    this.cdRef.detectChanges();
  }


  add(event: MatChipInputEvent): void {
    const inputName = (event.value || '').trim();
  
    // Find the user in the usersNotInChannel array
    const userToAdd = this.usersNotInChannel.find(u => u.name === inputName);
    console.log(this.usersNotInChannel)
  
    // Check if the user is found and not already added
    if (userToAdd && !this.users.some(u => u.id === userToAdd.id)) {
      this.users.push(userToAdd);
      
      // Remove the added user from usersNotInChannel
      this.usersNotInChannel = this.usersNotInChannel.filter(u => u.id !== userToAdd.id);
      // Update the filteredUsers Observable
      this.refreshFilteredUsers();
    }
  
    // Clear the input field
    event.chipInput!.clear();
  }
  
}