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


  public users: User[];
  public children: Child[];
  public base64pathPrefix:string=`data:image/jpeg;base64,`;

  constructor(private dbProvider: DatabaseProvider, public navCtrl: NavController, public navParams: NavParams, private modalCtrl: ModalController) {
    this.getChildrens();
    this.getAdults();
    //
  }


  goToChildSettingPage(child) {
    this.navCtrl.push(`ChildSettingPage`, { child: child })
  }

  presentAdultModal(user: User) {

    let adultSettingModal = this.modalCtrl.create(AdultSettingModalComponent, {
      user: name,
      img: +user.image,
    })
    adultSettingModal.onDidDismiss(del => {
      if (del) {

      }
    })
  }

  goToCreateChildCreationPage() {
    this.navCtrl.push(`ChildCreationPage`);

  }
  addAdultUser() {

    const adultModal = this.modalCtrl.create(AddAdultModalComponent, {});
    adultModal.present();

    adultModal.onDidDismiss(email => {
      console.log(email)
      if (email) {
        this.dbProvider.addUserToFamily(email);
      }
    })
  }
  getChildrens() {
    const famIdPromise = new Promise(res => {
      this.dbProvider.getUserFromDatabase(this.dbProvider.getUser).subscribe(user => {
        let dbUser = user.payload.data() as User
        res(dbUser.familyId);
      })
    })
    famIdPromise.then((ID: string) => {
      this.children = this.dbProvider.getChildrenOfFamily(ID);
    })
  }
  getAdults() {
    const famIdPromise = new Promise(res => {
      this.dbProvider.getUserFromDatabase(this.dbProvider.getUser).subscribe(user => {
        let dbUser = user.payload.data() as User
        res(dbUser.familyId);
      })
    })
    famIdPromise.then((ID: string) => {
      this.users = this.dbProvider.getAdultsOfFamily(ID);
    })
  }

}
