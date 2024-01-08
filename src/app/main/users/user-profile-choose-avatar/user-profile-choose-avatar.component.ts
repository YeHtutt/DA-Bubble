import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';

@Component({
  selector: 'app-user-profile-choose-avatar',
  templateUrl: './user-profile-choose-avatar.component.html',
  styleUrls: ['./user-profile-choose-avatar.component.scss']
})
export class UserProfileChooseAvatarComponent {
  @Output() avatarSelected = new EventEmitter<string>();
  avatars = ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png', 'avatar6.png'];
  urlToSelectedAvatar: string = '';

  constructor(private usersfbService: UsersFirebaseService,
    private dialogRef: MatDialogRef<UserProfileChooseAvatarComponent>
    ) {}

  
  /**
  * Sets a new profile picture for the user.
  * @param {any} image - The new image URL to set as the profile picture.
  */  
  setNewPic(image: any) {
      this.urlToSelectedAvatar = 'assets/img/avatar/' + image;
      this.avatarSelected.emit(this.urlToSelectedAvatar); 
      this.dialogRef.close();
  }

}
