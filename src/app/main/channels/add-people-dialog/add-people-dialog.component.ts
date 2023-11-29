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
  filteredUsers: Observable<any[]>;
  allUsers: any = [];
  users: any[] = [];
  isKnownUser: boolean = false;
  usersNotInChannel: UserProfile[] = [];
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usersService: UsersFirebaseService,
    private firebaseUtils: FirebaseUtilsService,
    private dialogRef: MatDialogRef<AddPeopleDialogComponent>,
    private announcer: LiveAnnouncer,
    private cdRef: ChangeDetectorRef,
    private channelService: ChannelService,
    private notificationsService: NotificationService,
    public drawerService: DrawerService
  ) {
    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(null),
      switchMap((user: string | null) => {
        return this.usersNotInChannelSubject.asObservable().pipe(
          map(users => user ? this._filter(user) : users.slice())
        );
      })
    );
  }
  

  ngOnInit() {
    this.getUsersNotInChannel();
    this.drawerService.checkMobileMode(window.innerWidth);
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
    let notInChannel: UserProfile[] = [];
    for (let oneUser of this.allUsers) {
      let found = false;
      for (let channelUser of usersInChannel) {
        if (oneUser.email === channelUser.email) {
          found = true;
          break;
        }
      }
      if (!found) notInChannel.push(oneUser.toJSON());
    }
    return notInChannel;
  }


  closeAddPeopleDialog() {
    this.dialogRef.close();
  }


  addUsers() {
    this.channel.usersData.push(...this.users);
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
      this.announcer.announce(`Removed ${name}`);
    }
  }


  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = event.option.value;
    this.users.push(selectedUser);
    this.userInput.nativeElement.value = '';
    this.userCtrl.setValue(null);
    this.checkKnownUsers();
    const index = this.usersNotInChannel.findIndex((user: any) => user.name === selectedUser.name);
    if (index !== -1) this.usersNotInChannel.splice(index, 1);
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
    if (typeof value !== 'string') return [];
    const filterValue = value.toLowerCase();
    return this.usersNotInChannel.filter((user: any) => user.name.toLowerCase().includes(filterValue));
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
    this.isKnownUser = this.usersNotInChannel.some((user: any) => user.name === inputValue);
    this.cdRef.detectChanges();
  }


  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) this.users.push({ name: value });
    event.chipInput!.clear();
    this.checkKnownUsers();
  }
}