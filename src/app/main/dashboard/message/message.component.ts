import { Component, Input } from '@angular/core';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';


@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {

  @Input() message: any;
  public currentUser: string | null = '';
  public checkIfEdit: boolean = false;
  public showEdit: boolean = false;
  editMessage: string = '';


  constructor(private userService: UsersFirebaseService,) {
    this.currentUser = this.userService.getFromLocalStorage();
  }

  getTimeOfDate(timestamp: any) {
    const date = new Date(timestamp.seconds * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formattedTime;
  }

  openMenu() {
    this.checkIfEdit = !this.checkIfEdit;
    setTimeout(() => this.checkIfEdit = !this.checkIfEdit, 2000);
  }

  openEdit(messageText: string) {
    this.showEdit = !this.showEdit
    this.editMessage = messageText;
    console.log(messageText)
  }

}
