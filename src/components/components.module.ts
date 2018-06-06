import { NgModule } from '@angular/core';
import { AdultSettingModalComponent } from './adult-setting-modal/adult-setting-modal';
import { AddAdultModalComponent } from './add-adult-modal/add-adult-modal';
import { IonicModule } from 'ionic-angular';
import { ChooseUserComponent } from './choose-user/choose-user';
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
