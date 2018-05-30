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





  }
  ionViewWillEnter() {
    console.log("Did enter")
    this.dbProvider.getCurrentUser().then(user => {
      this.familyId = user.familyId
      if (this.familyId) {
        console.log(this.familyId)
        this.children = this.getChildren();
        this.users = this.getAdults();
      }
    });

  }

  goToChildSettingPage(child, familyId) {
    console.log(child)
    this.navCtrl.push(`ChildSettingPage`, {
      child: child,
      famid: this.familyId
    })
  }

  presentAdultModal(user: {}) {
    
    let adultSettingModal = this.modalCtrl.create(AdultSettingModalComponent, {
      user: user
    });
    adultSettingModal.present();

    adultSettingModal.onDidDismiss((del?) => {
      this.dbProvider.getCurrentUser().then(res => {

        if (del && !(user[`email`] === res.email)) {
          console.log(user)
          this.dbProvider.deleteAdult(user,this.familyId);
        }
      })
    })
  }

  goToCreateChildCreationPage() {
    this.navCtrl.push(`ChildCreationPage`);
  }

  addAdultUser() {

    const adultModal = this.modalCtrl.create(AddAdultModalComponent, {});
    adultModal.present();

    adultModal.onDidDismiss(email => {
      let matchingUser: User;
      if (email) {

        this.dbProvider.findUser(email)
          .then((result) => {

            result.forEach(async user => {

              matchingUser = ((user.exists) && !user.data().familyId) ? user.data() as User : null;

            })
          }).then(async () => {

            await this.dbProvider.getCurrentUser().then(async (current) => {

              if (!current.familyId) {
              
                await this.dbProvider.addUserToFamily(current);
                await this.dbProvider.giveUserFamilyId(current);
                await this.dbProvider.getCurrentUser().then((updatedCurrent)=>{
                  current =updatedCurrent;
                  this.familyId=current.familyId;
                })
              }
            })
            await this.dbProvider.addUser(matchingUser, this.familyId).then(() => {

              this.dbProvider.giveUserFamilyId(matchingUser, this.familyId)
            });
          }).catch(err => console.error(err))
      }
    })
  }


  getChildren() {

    return this.dbProvider
      .getChildren();
  }

  getAdults() {
    return this.dbProvider
      .getFamilyMembers()
      .getAdults();
  }

}
