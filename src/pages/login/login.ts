import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../../models/user';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  registering: boolean;
  user: User;
  email: string;
  password: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth) { }

  login() {
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password)
      .catch(reason => console.error(reason));
  }

  signUp() {
    this.afAuth.auth.createUserWithEmailAndPassword(this.email, this.password)
      .catch(reason => console.error(reason));
  }

  register() {
    this.registering = true;
  }








}
