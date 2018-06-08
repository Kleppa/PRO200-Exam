import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CacheService } from 'ionic-cache';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  email: string;
  password: string;
  showPassword: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    private cache: CacheService) { }

  login() {
    this.cache.clearAll();
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password)
      .catch(reason => console.error(reason));
  }

  register() {
    this.navCtrl.push('RegisterPage');
  }

  togglePassword() {
    this.showPassword = (this.showPassword) ? false : true;
  }

}
