import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { UsersFirebaseService } from '../../../services/users-firebase.service';
import { UserProfileChooseAvatarComponent } from '../user-profile-choose-avatar/user-profile-choose-avatar.component';
import { AuthenticationService } from 'src/app/services/authentication.service';


@Component({
  selector: 'app-user-profile-edit',
  templateUrl: './user-profile-edit.component.html',
  styleUrls: ['./user-profile-edit.component.scss']
})
export class UserProfileEditComponent {
  url = 'assets/img/avatar/';
  currentPic = this.usersFbService.loggedInUserImg; //User current profile pic
  avatarPic: boolean = false;
  profileEditSuccess: boolean | null = null;

  ngOnInit() {
    this.profileEditSuccess = false;

    //der Standardwert für das Email-Feld setzten
    this.userEditForm.patchValue({
      email: this.usersFbService.loggedInUserEmail,
      name: this.usersFbService.loggedInUserName
    });
  }

  constructor(
    public dialog: MatDialog, public usersFbService: UsersFirebaseService,
    private dialogRef: MatDialogRef<UserProfileChooseAvatarComponent>,
    private notificationService: NotificationService,
    private authService: AuthenticationService
  ) { }

  userEditForm = new FormGroup({
    "email": new FormControl('', [Validators.required, Validators.email]),
    "name": new FormControl('', [Validators.required]),
  })


  async onEdit() {
    if (this.userEditForm.valid) {
      const formData = this.userEditForm.value;
      const currentUserID = this.usersFbService.getFromLocalStorage(); //von Localstorage currentuser Id rausholen
      this.saveNewPic(this.currentPic, currentUserID);
      this.changeEmailInAuth(formData.email);
      this.changeEmailInFirebase(currentUserID, formData);
    }
    this.dialog.closeAll();
  }

  changeEmailInAuth(newEmail: any) {
    try {
      this.authService.updateEmail(newEmail);
    } catch (error) {
      console.log('Change email failed')
    }
  }


  changeEmailInFirebase(currentUserID: string | null, formData: Object) {
    // Aktualisieren Sie das Benutzerprofil in Firestore
    this.usersFbService.updateUserProfile(currentUserID!, formData) //mit currentUserID und formDatas
      .then(() => {
        this.profileEditSuccess = true;
        this.openSnackBar();
      })
      .catch((error: any) => {
        this.profileEditSuccess = false;
        this.openSnackBar();
      });
  }


  /** user Profilbild mit eigene Bilder aus dem PC zu aktualisieren*/
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

  openSnackBar() {
    if (this.profileEditSuccess == true) {
      this.notificationService.showSuccess('Benutzerprofil erfolgreich aktualisiert.');
    } else {
      this.notificationService.showError('Benutzerprofil Aktualisierung fehlgeschlagen. Bitte prüfen Sie die Eingaben!')
    }
  }

  /** user Profilbild mit Avatare zu aktualisieren*/
  openAvatarDialog() {
    const dialogRef = this.dialog.open(UserProfileChooseAvatarComponent, {
      width: '500px',
      height: 'auto',
      data: { currentPic: this.currentPic },
      hasBackdrop: true,
      panelClass: 'user-profile-view-dialog',
      autoFocus: false,
    });

    dialogRef.componentInstance.avatarSelected.subscribe((selectedAvatar: string) => {
      this.setNewPic(selectedAvatar);
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
