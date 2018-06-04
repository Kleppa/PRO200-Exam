import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
import { DatabaseProvider } from '../../providers/database/database';
import { User } from '../../models/user';
import { Observable } from 'rxjs';
import { DocumentData } from 'angularfire2/firestore';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { ChooseUserComponent } from '../../components/choose-user/choose-user';
import { AddAdultModalComponent } from '../../components/add-adult-modal/add-adult-modal';

@IonicPage()
@Component({
  selector: 'page-my-family',
  templateUrl: 'my-family.html',
})
export class MyFamilyPage {
  private familyId: string;
  private mainUser: User;
  private adults: Observable<DocumentData[]>;
  private children: Observable<DocumentData[]>;
  private wishes: Observable<DocumentData[]>;
  itemsToShow:number = 3;

  constructor(public navCtrl: NavController, public navParams: NavParams, private dbProvider: DatabaseProvider, private modalController: ModalController) {
    this.dbProvider.getCurrentUser().then(async (user) => {
      await this.dbProvider.getFamilyMembers()
      this.mainUser = user;
      this.familyId = user.familyId;
    }).then(() => {
      if (this.familyId) {
        this.adults = this.dbProvider.getAdults();
        this.children = this.dbProvider.getChildren();
        this.wishes = this.dbProvider.getFamilyWishes(this.familyId);
      }
    })

  }

  incrementItemsToShow(number:number){
    this.itemsToShow+=number;
  }

  decreaseItemsToShow(number:number){
    this.itemsToShow-=number;
  }

  goToSetting() {
    this.navCtrl.push(`SettingsPage`);
  }


  goToChildSettingPage(child) {
    console.log(child)
    this.navCtrl.push(`ChildSettingPage`, {
      child: child,
      famid: this.familyId
    })
  }
  presentUserToAddModal() {
    const chooseUserModal = this.modalController.create(ChooseUserComponent);
    chooseUserModal.present();
    chooseUserModal.onDidDismiss((decision?) => {

      if (decision === 1) {
     
        this.navCtrl.push('ChildCreationPage')

      } else if (decision === 2) {
        
        this.addAdult();

      }
    })
  }
  addAdult(){
    const adultModal = this.modalController.create(AddAdultModalComponent);
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
}
