import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatePipe } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
/* Angular Material components */
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { CreateChannelDialogComponent } from './main/channels/create-channel-dialog/create-channel-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, matSnackBarAnimations } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';


/* Firestore */
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { MatChipsModule } from '@angular/material/chips';

/* FireStorage */
import { getStorage, provideStorage } from '@angular/fire/storage';


/* Components */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ChannelsComponent } from './main/channels/channels.component';
import { MainComponent } from './main/main.component';
import { NewMessageComponent } from './main/chat-components/new-message/new-message.component';
import { HeaderComponent } from './main/header/header.component';
import { SidenavComponent } from './main/sidenav/sidenav.component';
import { ThreadsComponent } from './main/threads/threads.component';

/* Module */
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChannelChatComponent } from './main/chat-components/channel-chat/channel-chat.component';
import { MessageComponent } from './main/chat-components/message/message.component';
import { ChatComponent } from './main/chat-components/chat/chat.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { ChooseAvatarComponent } from './auth/choose-avatar/choose-avatar.component';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { StartAnimationComponent } from './auth/start-animation/start-animation.component';
import { ChannelMenuComponent } from './main/channels/channel-menu/channel-menu.component';
import { UserProfileViewComponent } from './main/users/user-profile-view/user-profile-view.component';
import { ChannelUsersDialogComponent } from './main/channels/channel-users-dialog/channel-users-dialog.component';
import { UserProfileEditComponent } from './main/users/user-profile-edit/user-profile-edit.component';
import { UserProfileSubViewComponent } from './main/users/user-profile-sub-view/user-profile-sub-view.component';
import { DirectChatComponent } from './main/direct-chat/direct-chat.component';
import { EmojiPickerComponent } from './main/emoji-picker/emoji-picker.component';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { AddPeopleDialogComponent } from './main/channels/add-people-dialog/add-people-dialog.component';
import { ImprintComponent } from './main/imprint/imprint.component';
import { DataPrivacyComponent } from './main/data-privacy/data-privacy.component';
import { FilterPipe } from './main/pipes/filter.pipe';
import { CustomSnackbarComponent } from './custom-snackbar/custom-snackbar.component';
import { SearchBarComponent } from './main/search-bar/search-bar.component';
import { ProfileDialogComponent } from './main/header/profile-dialog/profile-dialog.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ScrollButtonComponent } from './main/scroll-button/scroll-button.component';
import { OpenUserMenuDialogComponent } from './main/channels/open-user-menu-dialog/open-user-menu-dialog.component';

registerLocaleData(localeDe, 'de-DE', localeDeExtra);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent,
    ChannelsComponent,
    MainComponent,
    NewMessageComponent,
    HeaderComponent,
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
    ChannelMenuComponent,
    UserProfileViewComponent,
    ChannelMenuComponent,
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
    ProfileDialogComponent,
    ClickOutsideDirective,
    ScrollButtonComponent,
    OpenUserMenuDialogComponent



  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
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
