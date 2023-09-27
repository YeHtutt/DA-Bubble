import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { DirectMessage } from './models/direct-message';
import { ChannelMessagesComponent } from './main/channel-messages/channel-messages.component';
import { DirectMessagesComponent } from './main/direct-messages/direct-messages.component';

const routes: Routes = [
  { path: 'main', component: MainComponent },
  {
    path: 'main', component: MainComponent,
    children: [
      { path: '', component: ChannelMessagesComponent },
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
export class AppRoutingModule { }
