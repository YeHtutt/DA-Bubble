import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { Message } from 'src/app/models/message';
import { UserProfile } from 'src/app/models/user-profile';
import { MessageService } from 'src/app/services/message.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  userId: string | null = '';
  text: string = '';
  message: Message = new Message();
  chatExists: boolean = false;
  currentUser: UserProfile = new UserProfile;
  public receiver: UserProfile = new UserProfile;
  messages$: Observable<any[]> = of([]);

  constructor(
    private messageService: MessageService,
    private route: ActivatedRoute,
    private userService: UsersFirebaseService
  ) {
    this.userService.getUser(this.userService.getFromLocalStorage()).then((user: any) => { this.currentUser = user });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.userId = params.get('id');
      this.userService.getUser(this.userId).then((user: any) => { this.receiver = user });
      this.messages$ = this.messageService.getChannelMessages('users', this.userId, 'message').pipe(
        map((messages) => {
          if (messages.length > 0) this.chatExists = true;
          return this.sortByDate(messages);
        }));
    });
  }

  sortByDate(message: any) {
    return message.sort((a: any, b: any) => {
      const dateA = a.time.seconds * 1000;
      const dateB = b.time.seconds * 1000;
      return dateA - dateB;
    });
  }



  send() {
    console.log(this.currentUser)
    this.createMessageObject();
    this.messageService.sendMessage(this.message, this.receiver, false);
    this.message = new Message();
  }

  createMessageObject() {
    this.message.text = this.text;
    this.message.time = new Date();
    this.message.messageId || '';
    this.message.user.push(this.currentUser);
  }
}
