import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUpload } from 'src/app/models/file-upload';
import { UserProfile } from 'src/app/models/user-profile';
import { FileStorageService } from 'src/app/shared/services/file-storage.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';


/**
 * ChooseAvatarComponent allows users to choose or upload a new avatar.
 * This component provides a selection of predefined avatars and the option to upload a custom avatar.
 */
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
    , private route: ActivatedRoute,
    private notificationService: NotificationService,
    private fileService: FileStorageService) {
    // Retrieve user's name from the route state
    this.route.paramMap.subscribe(params => {
      this.newUserName = params.get('userName') || '';
    });
  }


  /**
   * Sets the new picture for the avatar, either from predefined or uploaded by the user.
   * @param {string} image - The image filename or URL to be set as the new avatar.
   */
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


  /**
  * Handles the selection of a file upload for a custom avatar.
  * @param {Event} event - The file selection event containing the chosen file.
  */
  onSelect(event: any) {
    this.avatarPic = false;
    const file = new FileUpload(event.target.files[0]);
    let fileType = file.file.type;
    let fileSize = file.file.size;
    if (fileSize > 500 * 1024) {
      this.notificationService.showError('Die Datei ist zu groß. Bitte senden Sie eine Datei, die kleiner als 500KB ist.');
      return;
    }
    if (fileType.match(/image\/(png|jpeg|jpg)/)) {
      this.fileService.uploadFile(file).then(file => this.setNewPic(file.url));
    } else {
      this.notificationService.showError('Bitte nur png, jpg oder jpeg senden');
    }
  }
}