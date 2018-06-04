import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChildWishesPage } from './child-wishes';

@NgModule({
  declarations: [
    ChildWishesPage,
  ],
  imports: [
    IonicPageModule.forChild(ChildWishesPage),
  ],
})
export class ChildWishesPageModule {}
