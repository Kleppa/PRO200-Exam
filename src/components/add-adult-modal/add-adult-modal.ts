import { Component } from '@angular/core';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { ViewController } from 'ionic-angular/navigation/view-controller';

/**
 * Generated class for the AddAdultModalComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'add-adult-modal',
  templateUrl: 'add-adult-modal.html'
})
export class AddAdultModalComponent {

  email: string;

  constructor(private viewController: ViewController) {

  }
  dismiss() {
    if (this.email) {
      this.viewController.dismiss(this.email);
    } else {
      this.viewController.dismiss();
    }

  }

}
