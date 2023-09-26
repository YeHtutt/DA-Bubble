import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { DirectMessage } from './models/direct-message';
import { ChannelMessagesComponent } from './main/channel-messages/channel-messages.component';
import { DirectMessagesComponent } from './main/direct-messages/direct-messages.component';
import {canActivate, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import { AuthenticationService } from './services/authentication.service';

let docId: any;

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);
const redirectAuthorizedToMain = () => redirectLoggedInTo([`main/${docId}`]);

const routes: Routes = [
  { path:'', pathMatch: 'full', component: LoginComponent },
  { path: 'main/:docId', component: MainComponent },
  {
    path: 'main', component: MainComponent,
    children: [
      { path: 'channel', component: ChannelMessagesComponent },
      { path: 'direct', component: DirectMessagesComponent }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

  constructor(private authService: AuthenticationService) {
    const user = this.authService.getCurrentUser();
    if (user) {
      docId = user.uid; // used Firebase Authentication ID as user-ID 
    }
  }
}


