import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { CacheService } from 'ionic-cache';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: string;

  constructor(platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    af: AngularFireAuth,
    cache: CacheService) {
    platform.ready().then(() => {
      cache.setDefaultTTL(43200);
      cache.setOfflineInvalidate(false);
      
      af.authState.subscribe(user => this.rootPage = user ? "TabNav" : "LoginPage");

      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
