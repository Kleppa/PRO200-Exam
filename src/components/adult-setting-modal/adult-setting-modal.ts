import { Component } from '@angular/core';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { NavParams } from 'ionic-angular/navigation/nav-params';

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
  user:{};
  

  constructor(private navParams: NavParams,private viewController:ViewController) {
    this.user = this.navParams.get('user')
    
    this.viewController.getContent()
  }
  dismiss(command?:boolean) {

    if (command) {
      this.viewController.dismiss(command);
    } else {
      this.viewController.dismiss();
    }
  }
}
  
