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
  child:Child;

  constructor(private toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams, private dbProvider: DatabaseProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChildCreationPage');
  }
  cancel() {
    this.navCtrl.pop();
  }
  addChildToFamily() {
    
    if (!(this.child.name || this.child.age)) {
      this.presentFailureToast()
    } else {
      
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
