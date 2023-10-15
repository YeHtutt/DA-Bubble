import { Component } from '@angular/core';
import { UserProfile } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UsersFirebaseService } from '../../../services/users-firebase.service';
import { ChooseAvatarComponent } from 'src/app/auth/choose-avatar/choose-avatar.component';


@Component({
  selector: 'app-user-profile-edit',
  templateUrl: './user-profile-edit.component.html',
  styleUrls: ['./user-profile-edit.component.scss']
})
export class UserProfileEditComponent {
  url = 'assets/img/avatar/';
  currentPic = this.usersFbService.loggedInUserImg; //User current profile pic
  avatarPic: boolean = false;

  constructor(public dialog: MatDialog, public usersFbService: UsersFirebaseService ) { 
    
  }

  userEditForm = new FormGroup({
    "email": new FormControl('', [Validators.required, Validators.email]),
    "name": new FormControl('', [Validators.required]),
  })


  onEdit() {
    //console.log(this.userEditForm);
    if (this.userEditForm.valid) {
      const formData = this.userEditForm.value;
      const currentUserID = this.usersFbService.getFromLocalStorage(); //von Localstorage currentuser Id rausholen
      this.saveNewPic(this.currentPic, currentUserID);
      //console.log(currentUserID);
      
      if (currentUserID) {
        // Aktualisieren Sie das Benutzerprofil in Firestore
        this.usersFbService.updateUserProfile(currentUserID, formData) //mit currentUserID und formDatas
          .then(() => {
            console.log("Benutzerprofil erfolgreich aktualisiert.");
          })
          .catch((error: any) => {
            console.error("Fehler beim Aktualisieren des Benutzerprofils:", error);
          });
      }
    }
  }

  onSelect(event: any) {
    const file: File = event.target.files[0]; // ausgewählte Datei wird als variable file gespeichert (typ File interface)
    let fileType = file.type;
    let fileSize = file.size;
    if (fileSize > 500 * 1024) {
      window.alert('Die Datei ist zu groß. Bitte senden Sie eine Datei, die kleiner als 500KB ist.');
      return; // wenn die Datei zu groß ist, nicht ausgeben bzw. beenden.
    }
    if (fileType.match(/image\/(png|jpeg|jpg)/)) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
    
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.setNewPic(this.url);
        };
    } else {
      window.alert('Bitte nur png, jpg oder jpeg senden');
    }
  }

  setNewPic(image: any) {
    this.currentPic = image;
  }

  async saveNewPic(image: any, currentUserId: any) {
    this.usersFbService.saveUserPicFromDialog(image, this.avatarPic, currentUserId);
  }

}
