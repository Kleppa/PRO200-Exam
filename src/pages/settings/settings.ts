import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../models/user';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { AdultSettingModalComponent } from '../../components/adult-setting-modal/adult-setting-modal';
import { Child } from '../../models/child';
import { AddAdultModalComponent } from '../../components/add-adult-modal/add-adult-modal';
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs';
import { DocumentData } from 'angularfire2/firestore';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  public users: Observable<DocumentData[]>;
  public children: Observable<DocumentData[]>;
  private familyId;
  private childId;
  public base64pathPrefix: string = `data:image/jpeg;base64,`;

  constructor(private dbProvider: DatabaseProvider, public navCtrl: NavController, public navParams: NavParams, private modalCtrl: ModalController) {
    this.children = this.getChildren();
    this.users = this.getAdults();

   this.dbProvider.getCurrentUser().then(user=> this.familyId=user.familyId);
 
    
    
  }

  goToChildSettingPage(child,familyId) {
      console.log(child)
      this.navCtrl.push(`ChildSettingPage`, {
        child: child,
        famid: this.familyId
      })
  }

  presentAdultModal(user: User) {
    let adultSettingModal = this.modalCtrl.create(AdultSettingModalComponent, {
      user: name,
      img: user.image,
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


  getChildren() {
    return this.dbProvider
      .getFamilyMembers()
      .map(members => members.filter(member => member.tag == 'child'));
  }

  getAdults() {
    return this.dbProvider
      .getFamilyMembers()
      .map(members => members.filter(member => !member.tag));
  }

}
