import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../models/user';

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
    private af: AngularFirestore
  ) { }

  async register() {
    await this.signUp();
    await this.addUserProfile();
    await this.addUserToFamily();
  }

  signUp(): Promise<any> {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(this.user.email, this.password);
  }

  addUserProfile(): Promise<void> {
    return this.af.collection('users')
      .doc(this.afAuth.auth.currentUser.uid)
      .set(this.user);
  }

  addUserToFamily(): Promise<void> {
    return this.af.collection('families')
      .doc(this.af.createId())
      .collection('members')
      .doc(this.afAuth.auth.currentUser.uid)
      .set(this.user);
  }

}
