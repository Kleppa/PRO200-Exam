import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChildCreationPage } from './child-creation';

@NgModule({
  declarations: [
    ChildCreationPage,
  ],
  imports: [
    IonicPageModule.forChild(ChildCreationPage),
  ],
})
export class ChildCreationPageModule {}
