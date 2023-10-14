import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from 'src/app/services/channel.service';
import { DirectMessageService } from 'src/app/services/direct-message.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { UserProfileViewComponent } from '../user-profile-view/user-profile-view.component';
import { UserProfileSubViewComponent } from '../user-profile-sub-view/user-profile-sub-view.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ref, set, onDisconnect, getDatabase } from '@angular/fire/database';




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
    public directMessageService: DirectMessageService,
    public dialog: MatDialog,
    public authService: AuthenticationService,
    public afAuth: AngularFireAuth,

  ) {

  }

  //habe alles von channels übernommen das der tree standartmäßig geöffnet ist, klappt aber aus irgendeinem grund noch nicht
  ngOnInit() {
    // Restlicher Code...
    const sub = this.directMessageService.dataLoaded.subscribe(loaded => {
      if (loaded) {
        this.directMessageService.treeControl.expandAll();
      }
    });
    this.subscriptions.push(sub);
    this.directMessageService.subMessageList();


    this.afAuth.authState.subscribe(user => {
      if (user) {
        const db = getDatabase();
        const userStatusRef = ref(db, `/status/${user.uid}`);
        
        // Set user's online status to 'true'
        set(userStatusRef, { isOnline: true });

        // Handle disconnection
        onDisconnect(userStatusRef).set({ isOnline: false });
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
