import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../models/user';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
  user: User = {} as User;
  postal: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams) { }

}
