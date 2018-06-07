import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Child } from '../../models/child';
import { Camera, CameraOptions } from '@ionic-native/camera'
import { AngularFireAuth } from 'angularfire2/auth';
import { CacheService } from 'ionic-cache';
import { User } from '../../models/user';

@IonicPage()
@Component({
  selector: 'page-child-creation',
  templateUrl: 'child-creation.html',
})
export class ChildCreationPage {
  child = {} as Child;
  public base64Img: string;
  public btnText: string = "+"

  constructor(private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private dbProvider: DatabaseProvider,
    private afAuth: AngularFireAuth,
    private camera: Camera,
    private cache: CacheService) {
    this.child.tag = "child";
  }

  cancel() {
    this.navCtrl.pop();
  }

  async addChildToFamily() {
    let breakLimit = 0;
    let submitting: Loading;

    try {
      submitting = this.loadingCtrl.create({
        content: 'Starter opplasting...',
        enableBackdropDismiss: false
      });
      submitting.present();

      let user: User;
      await this.dbProvider.getCurrentUser().toPromise().then(async (usr) => {
        if (!usr.familyId) {
          submitting.setContent('Oppretter familie...');
          await this.dbProvider.addUserToFamily(usr);
          await this.dbProvider.giveUserFamilyId(usr);
          user = usr;
        }
      });

      if ((!this.child.name || !this.child.age)) {
        submitting.dismiss();
        this.presentFailureToast('Du må fylle inn barnets navn og alder.');
      } else {
        this.attachToken();

        if (this.base64Img) {
          const imgRef = `${this.afAuth.auth.currentUser.uid}_${new Date().getTime()}.jpeg`;
          submitting.setContent('Laster opp bilde...');

          await this.dbProvider.uploadImg(this.base64Img, imgRef).then((downloadurl) => {
            this.child.img = downloadurl;
          });
          submitting.setContent('Bilde lastet opp!');
        }

        if (breakLimit == 0) {
          console.log(user.familyId)
          submitting.setContent('legger til barnet i familie..');
          await this.dbProvider.addChildtoFamily(this.child, user.familyId);
          breakLimit++;
          this.cache.clearGroup("family");
          submitting.dismiss();
          this.presentSuccessToast();
          this.navCtrl.pop();
        }
      }
    } catch (err) {
      submitting.dismiss();

      console.error('Failed adding child to family', err);
      console.log(...err);
      console.log(err)
      this.presentFailureToast('Kunne ikke legge barnet til i familie, prøv igjen.');
    }
  }

  openGallery() {
    const options: CameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    };

    this.camera.getPicture(options)
      .then(imageBase64 => this.base64Img = imageBase64);
  }

  attachToken() {
    if (!this.child.token) {
      this.child.token = Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  }

  presentFailureToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: 'top',
      cssClass: "presentFailureToastStyle",
      showCloseButton: true,
      closeButtonText: "Lukk"
    });
    toast.present();
  }

  presentSuccessToast() {
    this.toastCtrl.create({
      message: "Gå på barnet i innstillinger for verfiseringskode til barneappen",
      duration: 5000,
      cssClass: "presentSuccessToastStyle",
      position: 'top',
      showCloseButton: true,
      closeButtonText: "Lukk"

    }).present();
  }

  getStyle(): {} {
    this.btnText = (this.base64Img) ? '' : '+';

    return {
      'background-image': this.base64Img ? `url(data:image/jpeg;base64,${this.base64Img})` : "",
      'background-size': "cover"
    }
  }

}
