import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Child } from '../../models/child';

/**
 * Generated class for the ChildCreationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-child-creation',
  templateUrl: 'child-creation.html',
})
export class ChildCreationPage {
  name: string;
  lastname: string;
  age: number;
  img: string;

  constructor(private toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams, private dbProvider: DatabaseProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChildCreationPage');
  }
  cancel() {
    this.navCtrl.pop();
  }
  addChildToFamily() {
    if (!(this.name || this.age)) {
      this.presentFailureToast()
    } else {
      const child: Child = {
        "name": this.name,
        "age": this.age,
        "lastname" : this.lastname,
        "img":this.img
      };

    }

  }
  presentFailureToast() {
    let toast = this.toastCtrl.create({
      message: 'Barnet trenger et navn og en alder',
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
}
