import { Component } from '@angular/core';
import { NavController } from 'ionic-angular/navigation/nav-controller';

/**
 * Generated class for the AdultSettingModalComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'adult-setting-modal',
  templateUrl: 'adult-setting-modal.html'
})
export class AdultSettingModalComponent {

  text: string;

  constructor() {
    console.log('Hello AdultSettingModalComponent Component');
    this.text = 'Hello World';
  }
  

}
