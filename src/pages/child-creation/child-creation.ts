import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Child } from '../../models/child';
import { Camera } from '@ionic-native/camera'


/**
 * Generated class for the ChildCreationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-child-creation',
  templateUrl: 'child-creation.html',
})
export class ChildCreationPage {
  child = {} as Child;
  private base64Img: string;

  constructor(private toastCtrl: ToastController
    , public navCtrl: NavController
    , public navParams: NavParams
    , private dbProvider: DatabaseProvider
    , private camera: Camera) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChildCreationPage');
  }
  cancel() {
    this.navCtrl.pop();
  }
  addChildToFamily() {

    if (!(this.child.name || this.child.age)) {

      this.presentFailureToast()

    } else {

      this.child.tag = "child";

      this.giveChildToken(this.child).then(() =>

        this.dbProvider.addChildtoFamily(this.child, this.dbProvider.getUser())).then(() => {

          if (this.base64Img) {

            const randomTime = new Date().getTime();
            const imgRef = `${this.dbProvider.getUser().uid}_${randomTime}`
            this.child.img = imgRef;

            this.dbProvider.uploadImg(this.base64Img, imgRef).then(() => {
              this.presentSuccessToast();
            });

          } else {
            this.presentSuccessToast();

          }
          this.navCtrl.pop();
        });
      }
  }
  openGallery() {

    const options = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      mediaType: this.camera.MediaType.ALLMEDIA,
      saveToPhotoAlbum: true
    };

    this.camera.getPicture(options).then(imageData => {
      console.log(imageData)

      return imageData;
    }).then(imageBase64 => {
      this.base64Img = imageBase64;
    })


  }
  giveChildToken(child) {
    return new Promise(res => {
      if (!this.child.token) {
        child.token = Math.random().toString(36).substr(2, 6).toUpperCase();
      }
      res();
    })
  }
  presentFailureToast() {
    let toast = this.toastCtrl.create({
      message: 'Barnet trenger et navn og en alder',
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
  presentSuccessToast() {
    this.toastCtrl.create({
      message: "Gå på barnet i innstillinger for barnets innlogginsnøkkel!",
      duration: 4000,
      position: 'top'
    }).present();
  }
}
