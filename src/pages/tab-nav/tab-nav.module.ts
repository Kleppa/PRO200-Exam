import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TabNav } from './tab-nav';

@NgModule({
  declarations: [
    TabNav,
  ],
  imports: [
    IonicPageModule.forChild(TabNav),
  ],
})
export class TabNavModule { }
