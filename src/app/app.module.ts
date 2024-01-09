import { DatePipe, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
/* Angular Material components */
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { CreateChannelDialogComponent } from './dashboard/channels/create-channel-dialog/create-channel-dialog.component';


/* Firestore */
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { MatChipsModule } from '@angular/material/chips';
import { environment } from '../environments/environment';

/* FireStorage */
import { getStorage, provideStorage } from '@angular/fire/storage';

/* Firebase Database */ 
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';


/* Components */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ChannelsComponent } from './dashboard/channels/channels.component';
import { EditChannelDialogComponent } from './dashboard/channels/edit-channel-dialog/edit-channel-dialog.component';
import { NewMessageComponent } from './dashboard/chat-components/new-message/new-message.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidenavComponent } from './dashboard/sidenav/sidenav.component';
import { ThreadsComponent } from './dashboard/threads/threads.component';

/* Module */
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { ChooseAvatarComponent } from './auth/choose-avatar/choose-avatar.component';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { StartAnimationComponent } from './auth/start-animation/start-animation.component';
import { CustomSnackbarComponent } from './custom-snackbar/custom-snackbar.component';
import { AddPeopleDialogComponent } from './dashboard/channels/add-people-dialog/add-people-dialog.component';
import { ChannelUsersDialogComponent } from './dashboard/channels/channel-users-dialog/channel-users-dialog.component';
import { ChannelChatComponent } from './dashboard/chat-components/channel-chat/channel-chat.component';
import { ChatComponent } from './dashboard/chat-components/chat/chat.component';
import { MessageComponent } from './dashboard/chat-components/message/message.component';
import { DataPrivacyComponent } from './data-privacy/data-privacy.component';
import { DirectChatComponent } from './dashboard/direct-chat/direct-chat.component';
import { EmojiPickerComponent } from './dashboard/emoji-picker/emoji-picker.component';
import { ImprintComponent } from './imprint/imprint.component';
import { FilterPipe } from './shared/pipes/filter.pipe';
import { SearchBarComponent } from './dashboard/search-bar/search-bar.component';
import { UserProfileEditComponent } from './dashboard/users/user-profile-edit/user-profile-edit.component';
import { UserProfileSubViewComponent } from './dashboard/users/user-profile-sub-view/user-profile-sub-view.component';
import { UserProfileViewComponent } from './dashboard/users/user-profile-view/user-profile-view.component';
import { ClickOutsideDirective } from './shared/directives/click-outside.directive';
import { UserMenuDialogComponent } from './dashboard/channels/user-menu-dialog/user-menu-dialog.component';
import { ScrollButtonComponent } from './dashboard/scroll-button/scroll-button.component';
import { UserProfileChooseAvatarComponent } from './dashboard/users/user-profile-choose-avatar/user-profile-choose-avatar.component';
import { UserPresenceComponent } from './dashboard/user-presence/user-presence.component';
import { VerificationEmailComponent } from './auth/verification-email/verification-email.component';
import { VerifiedSuccessComponent } from './auth/verified-success/verified-success.component';
import { DistributorComponent } from './auth/distributor/distributor.component';

registerLocaleData(localeDe, 'de-DE', localeDeExtra);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent,
    ChannelsComponent,
    DashboardComponent,
    NewMessageComponent,
    SidenavComponent,
    ThreadsComponent,
    CreateChannelDialogComponent,
    ChannelChatComponent,
    MessageComponent,
    ChatComponent,
    ResetPasswordComponent,
    ChooseAvatarComponent,
    ForgetPasswordComponent,
    StartAnimationComponent,
    EditChannelDialogComponent,
    UserProfileViewComponent,
    ChannelUsersDialogComponent,
    UserProfileEditComponent,
    UserProfileSubViewComponent,
    DirectChatComponent,
    EmojiPickerComponent,
    AddPeopleDialogComponent,
    ImprintComponent,
    DataPrivacyComponent,
    FilterPipe,
    CustomSnackbarComponent,
    SearchBarComponent,
    ClickOutsideDirective,
    ScrollButtonComponent,
    UserMenuDialogComponent,
    UserProfileChooseAvatarComponent,
    UserPresenceComponent,
    VerificationEmailComponent,
    VerifiedSuccessComponent,
    DistributorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    AngularFireDatabaseModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTreeModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatDividerModule,
    AngularFireAuthModule,
    MatSnackBarModule,
    MatRadioModule,
    MatChipsModule,
    PickerModule,


  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-DE' },
    
    DatePipe,
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
