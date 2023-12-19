import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUpload } from 'src/app/models/file-upload';
import { UserProfile } from 'src/app/models/user-profile';
import { FileStorageService } from 'src/app/shared/services/file-storage.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';

@Component({
  selector: 'app-choose-avatar',
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.scss']
})
export class ChooseAvatarComponent {

  avatars = ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png', 'avatar6.png'];
  currentPic = 'assets/img/avatar/person.png'; //default Pic
  url = 'assets/img/avatar/';
  newUserID: any;
  avatarPic: boolean = true;
  urlToSelectedAvatar: string = '';
  user: UserProfile = new UserProfile;
  newUserName: string = '';


  constructor(private router: Router, 
    private usersfbService: UsersFirebaseService
    ,private route: ActivatedRoute,
    private notificationService: NotificationService,
    private fileService: FileStorageService) {
    // Retrieve user's name from the route state
    this.route.paramMap.subscribe(params => {
      this.newUserName = params.get('userName') || '';
    });
  }


  setNewPic(image: any) {
    this.currentPic = image;
    if (this.avatarPic) {
      this.urlToSelectedAvatar = 'assets/img/avatar/' + image;
    } else {
      this.urlToSelectedAvatar = image;
      this.avatarPic = true;
    }
  }


  async saveNewPic() {
    this.usersfbService.saveUserPic(this.urlToSelectedAvatar);
    setTimeout(() => {
      this.router.navigate(['/verify-email'])
    })
  }


  onSelect(event: any) {
    this.avatarPic = false;
    const file = new FileUpload(event.target.files[0]); // ausgewählte Datei wird als variable file gespeichert (typ File interface)
    let fileType = file.file.type;
    let fileSize = file.file.size;
    if (fileSize > 500 * 1024) {
      this.notificationService.showError('Die Datei ist zu groß. Bitte senden Sie eine Datei, die kleiner als 500KB ist.');
      return; // wenn die Datei zu groß ist, nicht ausgeben bzw. beenden.
    }
    if (fileType.match(/image\/(png|jpeg|jpg)/)) {
      this.fileService.uploadFile(file).then(file => this.setNewPic(file.url));
    } else {
      this.notificationService.showError('Bitte nur png, jpg oder jpeg senden');
    }
  }
}