import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ChannelChatComponent } from './main/chat-components/channel-chat/channel-chat.component';
import { NewMessageComponent } from './main/chat-components/new-message/new-message.component';
import {canActivate, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import { AuthenticationService } from './services/authentication.service';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { ChooseAvatarComponent } from './auth/choose-avatar/choose-avatar.component';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { ChatComponent } from './main/chat-components/chat/chat.component';
import { StartAnimationComponent } from './auth/start-animation/start-animation.component';
import { DirectMessageComponent } from './main/direct-message/direct-message.component';
import { ImprintComponent } from './main/imprint/imprint.component';



let docId: any;

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);
const redirectAuthorizedToMain = () => redirectLoggedInTo([`main`]);

const routes: Routes = [
  { path: '', redirectTo: 'start', pathMatch: 'full' },
  { path: 'start', component: StartAnimationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'forget-password', component: ForgetPasswordComponent},
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'choose-avatar', component: ChooseAvatarComponent},
  { path: 'imprint', component: ImprintComponent},

  { path: 'main', component: MainComponent,
    children: [
      { path: 'channel/:channelId', component: ChannelChatComponent },
      { path: 'message', component: NewMessageComponent },
      { path: 'chat/:chatId', component: ChatComponent }     
    ]
  },
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


