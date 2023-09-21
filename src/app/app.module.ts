import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ChannelsComponent } from './main/channels/channels.component';
import { MainComponent } from './main/main.component';
import { DirectMessagesComponent } from './main/direct-messages/direct-messages.component';
import { DashboardComponent } from './main/dashboard/dashboard.component';
import { HeaderComponent } from './main/header/header.component';
import { SidenavComponent } from './main/sidenav/sidenav.component';
import { ThreadsComponent } from './main/threads/threads.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent,
    ChannelsComponent,
    MainComponent,
    DirectMessagesComponent,
    DashboardComponent,
    HeaderComponent,
    SidenavComponent,
    ThreadsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
