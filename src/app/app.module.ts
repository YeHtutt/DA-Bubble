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
import { CreateChannelDialogComponent } from './main/channels/create-channel-dialog/create-channel-dialog.component';


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
import { ChannelsComponent } from './main/channels/channels.component';
import { EditChannelDialogComponent } from './main/channels/edit-channel-dialog/edit-channel-dialog.component';
import { NewMessageComponent } from './main/chat-components/new-message/new-message.component';
import { MainComponent } from './main/main.component';
import { SidenavComponent } from './main/sidenav/sidenav.component';
import { ThreadsComponent } from './main/threads/threads.component';

/* Module */
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { ChooseAvatarComponent } from './auth/choose-avatar/choose-avatar.component';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { StartAnimationComponent } from './auth/start-animation/start-animation.component';
import { CustomSnackbarComponent } from './custom-snackbar/custom-snackbar.component';
import { AddPeopleDialogComponent } from './main/channels/add-people-dialog/add-people-dialog.component';
import { ChannelUsersDialogComponent } from './main/channels/channel-users-dialog/channel-users-dialog.component';
import { ChannelChatComponent } from './main/chat-components/channel-chat/channel-chat.component';
import { ChatComponent } from './main/chat-components/chat/chat.component';
import { MessageComponent } from './main/chat-components/message/message.component';
import { DataPrivacyComponent } from './main/data-privacy/data-privacy.component';
import { DirectChatComponent } from './main/direct-chat/direct-chat.component';
import { EmojiPickerComponent } from './main/emoji-picker/emoji-picker.component';
import { ImprintComponent } from './main/imprint/imprint.component';
import { FilterPipe } from './main/pipes/filter.pipe';
import { SearchBarComponent } from './main/search-bar/search-bar.component';
import { UserProfileEditComponent } from './main/users/user-profile-edit/user-profile-edit.component';
import { UserProfileSubViewComponent } from './main/users/user-profile-sub-view/user-profile-sub-view.component';
import { UserProfileViewComponent } from './main/users/user-profile-view/user-profile-view.component';

import { ClickOutsideDirective } from './directives/click-outside.directive';
import { UserMenuDialogComponent } from './main/channels/user-menu-dialog/user-menu-dialog.component';
import { ScrollButtonComponent } from './main/scroll-button/scroll-button.component';
import { UserProfileChooseAvatarComponent } from './main/users/user-profile-choose-avatar/user-profile-choose-avatar.component';
import { UserPresenceComponent } from './main/user-presence/user-presence.component';
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
    MainComponent,
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
