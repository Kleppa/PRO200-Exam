import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Child } from '../../models/child';
import * as shortid from 'shortid'
import { Clipboard } from '@ionic-native/clipboard';
import { ToastController } from 'ionic-angular';
/**
 * Generated class for the ChildSettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-child-setting',
  templateUrl: 'child-setting.html',
})
export class ChildSettingPage {
  public child: Child;
  constructor(private navCtrl: NavController, private navParams: NavParams, private clipboard: Clipboard, private toastCtrl: ToastController) {

    this.child = navParams.get('child');

    if (!this.child.token) {
      this.child.token = shortid.generate();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChildSettingPage');
  }
  addToClipboard() {
    this.clipboard.copy(this.child.token).then(()=>{
      this.toastCtrl.create({
        message:`Kopiert!`,
        duration:1500,
        position: `top`

      });
    });
  }
}
