import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth
  ) { }

  logout(): void {
    this.afAuth.auth.signOut()
      .then(reason => {
        console.info(reason);
        this.navCtrl.pop();
      })
      .catch(reason => console.error(reason));
  }

}
