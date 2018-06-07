import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
import { DatabaseProvider } from '../../providers/database/database';
import { User } from '../../models/user';
import { Observable } from 'rxjs';
import { count } from 'rxjs/operators';
import { DocumentData } from 'angularfire2/firestore';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { ChooseUserComponent } from '../../components/choose-user/choose-user';
import { AddAdultModalComponent } from '../../components/add-adult-modal/add-adult-modal';
import { Child } from '../../models/child';
import { ChildWishesPage } from '../child-wishes/child-wishes';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { CacheService } from 'ionic-cache';
import { Item } from '../../models/item';

@IonicPage()
@Component({
  selector: 'page-my-family',
  templateUrl: 'my-family.html',
})
export class MyFamilyPage {
  public itemsInCart$: Observable<Item[]>;
  private familyId: string;
  private mainUser: User;
  public adults: Observable<DocumentData[]>;
  public children: Observable<DocumentData[]>;
  public wishes: Observable<DocumentData[]>;
  public priceOfCart: number = 0;
  itemsToShow: number = 3;
  wishListSize: number = 0;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private dbProvider: DatabaseProvider,
    private modalController: ModalController,
    private toast: ToastController,
    private cache: CacheService) { this.initObs(); }

  ionViewWillEnter() {
    console.log("Will enter")
    this.initObs();
  }

  initObs() {
    this.adults = this.dbProvider.getAdults();
    this.children = this.dbProvider.getChildren();
    this.itemsInCart$ = this.dbProvider.getCartItems();
    this.wishes = this.dbProvider.getFamilyWishes().map(items => {
      return items.filter(item => { 
        if( item['status'] === `venter`){
          this.wishListSize++;
          return true;
        }
       });
    });

    this.itemsInCart$.filter(item => { return (item.pop() != undefined) }).map(items => items.pop().price)
      .subscribe(price => this.priceOfCart = (price) ? this.priceOfCart + price : 0);

    this.dbProvider.getCurrentUser()
      .subscribe(user => {
        this.mainUser = user;
        this.familyId = user.familyId;
        console.log('familyId: ', this.familyId);
      });
  }

  goToChildWishes(child: Child) {
    this.navCtrl.push(`ChildWishesPage`, {
      child: child,
      wishes: this.dbProvider.getFamilyWishes().map(items => {
        return items.filter(item => item[`childToken`] === child.token && item['status'] === `venter`);
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
        this.cache.clearGroup('family');
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
              this.cache.clearGroup("family");
            });
          }).catch(err => console.error(err));
      }
    });
  }

  numberOfChildWishes(child: Child) {
    return this.wishes.filter(wish => wish[`childToken`] === child.token).count();
  }

  denyWish(wish) {
    this.wishListSize--;
    this.dbProvider.denyWish(wish);

    this.toast.create({
      message: "Vare avslått",
      duration: 2500,
      position: `top`,
      cssClass: "redToastStyle",
      showCloseButton: true,
      closeButtonText: "Lukk"
    }).present();
  }

  addWishToCart(wish) {
    this.dbProvider.addWishToCart(wish);
    this.wishListSize--;
    this.toast.create({
      message: "Vare lagt i handlekurven",
      duration: 2500,
      position: `top`,
      cssClass: "greenToastStyle",
      showCloseButton: true,
      closeButtonText: "Lukk"

    }).present();
  }

}
