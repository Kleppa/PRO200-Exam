import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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
    private dbProvider:DatabaseProvider
  ) { }

  async register() {
    await this.signUp();
    await this.dbProvider.addUserToFamily(this.user);
    await this.dbProvider.addUserProfile(this.user);
    
  }
  signUp(): Promise<any> {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(this.user.email, this.password);
  }

 

}
