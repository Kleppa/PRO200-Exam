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
import { Child } from '../../models/child';
import { ChildWishesPage } from '../child-wishes/child-wishes';

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
  public itemsInCart;
  public priceOfCart: number;
  itemsToShow: number = 3;

  constructor(public navCtrl: NavController, public navParams: NavParams, private dbProvider: DatabaseProvider, private modalController: ModalController) {
    this.adults = this.dbProvider.getAdults();
    this.children = this.dbProvider.getChildren();
    this.itemsInCart = this.dbProvider.getNumberOfItemsInCart();
    this.wishes = (this.familyId)
      ? this.dbProvider.getFamilyWishes(this.familyId).map(items => {
        return items.filter(item => {
          console.log("ITEM", item)
          return item.status === `venter`
        });
      })
      : Observable.empty();

    this.dbProvider.getCurrentUser()
      .subscribe(user => {
        this.mainUser = user;
        this.familyId = user.familyId;
      });
  }

  goToChildWishes(child: Child) {
    this.navCtrl.push(`ChildWishesPage`, {
      child: child,
      wishes: this.dbProvider.getFamilyWishes(this.familyId).map(items => {

        return items.filter(item => item[`childToken`] === child.token && item.status === `venter`);
      })
    });
  }

  incrementItemsToShow(number: number) {
    this.itemsToShow += number;
  }

  decreaseItemsToShow(number: number) {
    this.itemsToShow -= number;
  }

  goToSetting() {
    this.navCtrl.push(`SettingsPage`);
  }

  goToChildSettingPage(child) {
    console.log(child)
    this.navCtrl.push(`ChildSettingPage`, {
      child: child,
      famid: this.familyId
    });
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
    });
  }

  addAdult() {
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

            await this.dbProvider.getCurrentUser().subscribe(async (current) => {

              if (!current.familyId) {
                await this.dbProvider.addUserToFamily(current);
                await this.dbProvider.giveUserFamilyId(current);
                await this.dbProvider.getCurrentUser().subscribe((updatedCurrent) => {
                  current = updatedCurrent;
                  this.familyId = current.familyId;
                })
              }
            })
            await this.dbProvider.addUser(matchingUser, this.familyId).then(() => {

              this.dbProvider.giveUserFamilyId(matchingUser, this.familyId)
            });
          }).catch(err => console.error(err));
      }
    });
  }

  numberOfChildWishes(child: Child) {
    return this.wishes.filter(wish => wish[`childToken`] === child.token).count();
  }
  denyWish(wish) {
    this.dbProvider.denyWish(wish);
  }
  addWishToCart(wish) {
    this.dbProvider.addWishToCart(wish);
  }
}
