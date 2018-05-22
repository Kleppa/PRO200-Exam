import { NgModule } from '@angular/core';
import { AdultSettingModalComponent } from './adult-setting-modal/adult-setting-modal';
import { AddAdultModalComponent } from './add-adult-modal/add-adult-modal';
import { IonicModule } from 'ionic-angular';
@NgModule({
	declarations: [AdultSettingModalComponent,
    AddAdultModalComponent],
	imports: [IonicModule],
	exports: [AdultSettingModalComponent,
    AddAdultModalComponent]
})
export class ComponentsModule {}
