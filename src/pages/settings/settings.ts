import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../models/user';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { AdultSettingModalComponent } from '../../components/adult-setting-modal/adult-setting-modal';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

public users:User[];
public children:string[];

  constructor(public navCtrl: NavController, public navParams: NavParams, private modalCtrl:ModalController) {
  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }
  goToChildSettingPage(child){

  }
  presentAdultModal(user:User){
    this.modalCtrl.create(AdultSettingModalComponent,{
      user:name,
      img:user.image,
    })
  }

}