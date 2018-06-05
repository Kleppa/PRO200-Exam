import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Child } from '../../models/child';
import { DatabaseProvider } from '../../providers/database/database';

/**
 * Generated class for the ChildWishesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-child-wishes',
  templateUrl: 'child-wishes.html',
})
export class ChildWishesPage {
  wishes;
  child:Child;
  constructor(public navCtrl: NavController, public navParams: NavParams, private dbProvider:DatabaseProvider) {

    this.child = this.navParams.get(`child`);

   this.wishes =this.navParams.get(`wishes`);

   
  }
  denyWish(wish){
    this.dbProvider.denyWish(wish);
  }
  addWishToCart(wish){
    this.dbProvider.addWishToCart(wish);
  }

}
