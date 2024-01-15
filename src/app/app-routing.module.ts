import { NgModule } from '@angular/core';
import { redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { ChooseAvatarComponent } from './auth/choose-avatar/choose-avatar.component';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { LoginComponent } from './auth/login/login.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { StartAnimationComponent } from './auth/start-animation/start-animation.component';
import { ChannelChatComponent } from './dashboard/chat-components/channel-chat/channel-chat.component';
import { ChatComponent } from './dashboard/chat-components/chat/chat.component';
import { NewMessageComponent } from './dashboard/chat-components/new-message/new-message.component';
import { DataPrivacyComponent } from './data-privacy/data-privacy.component';
import { ImprintComponent } from './imprint/imprint.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthenticationService } from './shared/services/authentication.service';
import { VerificationEmailComponent } from './auth/verification-email/verification-email.component';
import { VerifiedSuccessComponent } from './auth/verified-success/verified-success.component';
import { DistributorComponent } from './auth/distributor/distributor.component';
import { authGuard } from './shared/services/auth-guard.service';

let docId: any;

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);
const redirectAuthorizedToMain = () => redirectLoggedInTo([`dashboard`]);

const routes: Routes = [
  { path: '', redirectTo: 'start', pathMatch: 'full' },
  { path: 'start', component: StartAnimationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'choose-avatar', component: ChooseAvatarComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'data-privacy', component: DataPrivacyComponent },
  { path: 'verify-email', component: VerificationEmailComponent },
  { path: 'verification-success', component: VerifiedSuccessComponent },
  { path: 'distributor', component: DistributorComponent },

  {
    path: 'dashboard', component: DashboardComponent,
    /*    canActivate: [authGuard], */
    children: [
      { path: 'channel/:channelId', component: ChannelChatComponent },
      { path: 'message', component: NewMessageComponent },
      { path: 'chat/:chatId', component: ChatComponent },
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


