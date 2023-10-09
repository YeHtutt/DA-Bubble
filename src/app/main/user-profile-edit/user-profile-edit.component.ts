import { Component } from '@angular/core';
import { UserProfile } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UsersFirebaseService } from '../../services/users-firebase.service';


@Component({
  selector: 'app-user-profile-edit',
  templateUrl: './user-profile-edit.component.html',
  styleUrls: ['./user-profile-edit.component.scss']
})
export class UserProfileEditComponent {

  constructor(public dialog: MatDialog, private usersFbService: UsersFirebaseService ) { 
    
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

}
