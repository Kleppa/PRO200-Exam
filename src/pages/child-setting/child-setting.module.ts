import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChildSettingPage } from './child-setting';

@NgModule({
  declarations: [
    ChildSettingPage,
  ],
  imports: [
    IonicPageModule.forChild(ChildSettingPage),
  ],
})
export class ChildSettingPageModule {}
