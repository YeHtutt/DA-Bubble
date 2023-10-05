import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserProfile } from 'src/app/models/user-profile';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

@Component({
  selector: 'app-choose-avatar',
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.scss']
})
export class ChooseAvatarComponent {
  avatars = ['avatar1.png','avatar2.png','avatar3.png','avatar4.png','avatar5.png','avatar6.png' ];
  currentPic = '../assets/img/avatar/person.png'; //default Pic
  url = 'assets/img/avatar/';
  newUserID:any;
  avatarPic: boolean = true;


  user: UserProfile = new UserProfile;
  

  constructor(private router: Router, private usersfbService: UsersFirebaseService, private auth: Auth) {

  }


  setNewPic(image: any) {
    this.currentPic = image;
  }

  async saveNewPic(image: any) {
    this.usersfbService.saveUserPic(image);
    setTimeout(() => {
      this.router.navigate(['/login'])
    })
  }
}
