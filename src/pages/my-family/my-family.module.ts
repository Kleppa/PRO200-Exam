import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyFamilyPage } from './my-family';

@NgModule({
  declarations: [
    MyFamilyPage,
  ],
  imports: [
    IonicPageModule.forChild(MyFamilyPage),
  ],
})
export class MyFamilyPageModule {}
