import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { User } from '../../models/user';
import { DatabaseProvider } from '../../providers/database/database';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
  user: User = {} as User;
  password: string;
  postal: string = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private af: AngularFirestore,
    private dbProvider: DatabaseProvider,
    private toastCtrl: ToastController
  ) { }

  async register() {
    if (!this.verify()) return;
    await this.signUp().catch(err => this.fail(err));
    await this.dbProvider.addUserProfile(this.user);
  }

  signUp(): Promise<any> {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(this.user.email, this.password);
  }

  verify(): boolean {
    if (!this.user.email) { this.fail('Du må fylle inn epost'); return false; }
    else if (!this.password) { this.fail('Du må fylle inn passord'); return false; }
    else if (!this.user.first_name) { this.fail('Du må fylle inn navn'); return false; }
    else { this.success(); return true; }
  }

  fail(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: 'redToastStyle'
    }).present();
  }

  success() {
    this.toastCtrl.create({
      message: 'Opprettet bruker ' + this.user.email,
      duration: 3000,
      position: 'top',
      cssClass: 'greenToastStyle'
    }).present();
  }

}
