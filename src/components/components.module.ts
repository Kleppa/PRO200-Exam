import { NgModule } from '@angular/core';
import { AdultSettingModalComponent } from './adult-setting-modal/adult-setting-modal';
import { AddAdultModalComponent } from './add-adult-modal/add-adult-modal';
import { IonicModule } from 'ionic-angular';
import { ChooseUserComponent } from './choose-user/choose-user';
<<<<<<< HEAD

=======
//import { CartComponent } from './cart/cart';
>>>>>>> 0354d9bd81eed7b4ea2f87dbdb0f2445f4f73bd3
@NgModule({
	declarations: [AdultSettingModalComponent,
    AddAdultModalComponent,
    ChooseUserComponent,
   // CartComponent
],
	imports: [IonicModule],
	exports: [AdultSettingModalComponent,
    AddAdultModalComponent,
    ChooseUserComponent,
   // CartComponent
]
})
export class ComponentsModule {}
