import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from 'src/app/services/channel.service';
import { MessageTreeService } from 'src/app/services/message-tree.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { UserProfileViewComponent } from '../users/user-profile-view/user-profile-view.component';
import { UserProfileSubViewComponent } from '../users/user-profile-sub-view/user-profile-sub-view.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ref, set, onDisconnect, getDatabase } from '@angular/fire/database';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';



@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  showSidenav: boolean = true;
  @Input() channel_window: any;
  user: any;

  private subscriptions: Subscription[] = [];

  constructor(
    private Route: ActivatedRoute,
    private router: Router,
    public channelService: ChannelService,
    public messageTreeService: MessageTreeService,
    public dialog: MatDialog,
    public authService: AuthenticationService,
    public afAuth: AngularFireAuth,
    private userService: UsersFirebaseService

  ) {

  }

  //habe alles von channels übernommen das der tree standartmäßig geöffnet ist, klappt aber aus irgendeinem grund noch nicht
  ngOnInit() {
    // Restlicher Code...
    const sub = this.messageTreeService.dataLoaded.subscribe(loaded => {
      if (loaded) {
        this.messageTreeService.treeControl.expandAll();
      }
    });
    this.subscriptions.push(sub);
    this.messageTreeService.subMessageList();



  }



  ngOnDestroy() {
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        debugger
        this.user = user;
        const db = getDatabase();
        const userStatusRef = ref(db, `/status/${user.uid}`);

        // Set user's online status to 'true' in Firestore and Realtime Database
        await this.userService.updateUserOnlineStatus(user.uid, true);
        set(userStatusRef, { isOnline: true });

        // Handle disconnection
        onDisconnect(userStatusRef).set(async () => {
          await this.userService.updateUserOnlineStatus(user.uid, false);
        });
      }
    });
  }

  toggleExpanded(node: any) {
    this.channelService.treeControl.toggle(node);
  }


  toggleSidenav() {
    if (this.showSidenav) {
      this.showSidenav = false;
      console.log('true');
    } else {
      this.showSidenav = true;
      console.log('false');
    }
  }

  openProfileDialog(node: any) {
    const userId = node.id;
    const userName = node.name;
    const userPhotoURL = node.photoURL;
    const userEmail = node.email;
    const isOnline = node.isOnline;

    this.dialog.open(UserProfileSubViewComponent, {
      width: '500px',
      height: '727px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      data: {
        id: userId,
        name: userName,
        photoURL: userPhotoURL,
        email: userEmail,
        isOnline: isOnline
      }
    });
  }
}
