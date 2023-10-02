import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersFirebaseService } from '../services/users-firebase.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  ngOnInit(): void {
    /*this.userFbService.getLoggedInUser(this.auth.currentUser?.uid);
    console.log('currentUserID:__', this.auth.currentUser?.uid );*/
  }

  constructor(private Route: ActivatedRoute, private router: Router, private userFbService: UsersFirebaseService, private auth:Auth) {}

}
