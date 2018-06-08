import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { CacheService } from 'ionic-cache';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private cache: CacheService
  ) { }

  logout(): void {
    this.afAuth.auth.signOut()
      .then(reason => {
        console.info(reason);
        this.cache.clearAll();
        this.navCtrl.setRoot('LoginPage');
        this.navCtrl.popToRoot();
      });
  }

}
