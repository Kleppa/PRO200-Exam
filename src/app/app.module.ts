import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { MyApp } from './app.component';

import env from '../env';
import { DatabaseProvider } from '../providers/database/database';
import { AddAdultModalComponent } from '../components/add-adult-modal/add-adult-modal';
import { Clipboard } from '@ionic-native/clipboard';
import { Camera } from '@ionic-native/camera';
import { AngularFireStorageModule, AngularFireStorage } from 'angularfire2/storage';
import { AdultSettingModalComponent } from '../components/adult-setting-modal/adult-setting-modal';
import { ChooseUserComponent } from '../components/choose-user/choose-user';

import { CacheModule } from 'ionic-cache';

@NgModule({
  declarations: [
    MyApp,
    AddAdultModalComponent,
    AdultSettingModalComponent,
    ChooseUserComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(env),
    AngularFirestoreModule,
    AngularFireAuthModule,
    CacheModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AddAdultModalComponent,
    AdultSettingModalComponent,
    ChooseUserComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    DatabaseProvider,
    Clipboard,
    Camera,
    AngularFireStorage,
  ]
})
export class AppModule { }