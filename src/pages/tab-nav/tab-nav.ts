import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'tab-nav',
  templateUrl: 'tab-nav.html',
})
export class TabNav {
  tab1 = 'HomePage';
  tab2 = 'HomePage';
  tab3 = 'HomePage';
  tab4 = 'ProfilePage';
  tab5 = 'MyFamilyPage';

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  
}
