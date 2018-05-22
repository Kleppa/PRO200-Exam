import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../models/user';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { AdultSettingModalComponent } from '../../components/adult-setting-modal/adult-setting-modal';
import { Child } from '../../models/child';
import { AddAdultModalComponent } from '../../components/add-adult-modal/add-adult-modal';
import { DatabaseProvider } from '../../providers/database/database';

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
public children:Child[];

  constructor(private dbProvider:DatabaseProvider,public navCtrl: NavController, public navParams: NavParams, private modalCtrl:ModalController) {
  
  }

 
  goToChildSettingPage(child){

  }
  
  presentAdultModal(user:User){
    let adultSettingModal = this.modalCtrl.create(AdultSettingModalComponent,{
      user:name,
      img:user.image,
    })
     adultSettingModal.onDidDismiss(del=>{
      if(del){
       
      }
    })
  }

  createChildUser(){

  }
  addAdultUser(){
  
    const adultModal = this.modalCtrl.create(AddAdultModalComponent,{});
    adultModal.present();

    adultModal.onDidDismiss(email =>{
      console.log(email)
      if(email){
      this.dbProvider.addUserToFamily(email);
      }
    })
  }

}
