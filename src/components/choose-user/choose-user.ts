import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { ViewController } from 'ionic-angular/navigation/view-controller';

/**
 * Generated class for the ChooseUserComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'choose-user',
  templateUrl: 'choose-user.html'
})
export class ChooseUserComponent {



  constructor(private viewCtrl:ViewController) {
   
  }
  dismiss(command?){
   this.viewCtrl.dismiss(command);
  }

}
