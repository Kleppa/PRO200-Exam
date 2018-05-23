import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Rx';

@IonicPage()
@Component({
  selector: 'page-my-family',
  templateUrl: 'my-family.html',
})
export class MyFamilyPage {
  family: Observable<{}[]>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: DatabaseProvider,
    private afAuth: AngularFireAuth) {
  }

  goToSetting() {
    this.navCtrl.push(`SettingsPage`);
  }

  getFamilyMembers() {
    this.family = this.db.getFamily().collection('members').valueChanges();
  }

}
