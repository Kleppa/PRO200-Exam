import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Child } from '../../models/child';
import * as shortid from 'shortid'
import { Clipboard } from '@ionic-native/clipboard';
import { ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { CacheService } from 'ionic-cache';
/**
 * Generated class for the ChildSettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-child-setting',
  templateUrl: 'child-setting.html',
})
export class ChildSettingPage {
  base64Img: string = ""
  childImg;
  public child: Child;
  public limit: string;
  public limitations: string[];
  private famId;
  changes: boolean = false;

  constructor(private afAuth: AngularFireAuth,
    private dbProvider: DatabaseProvider,
    private camera: Camera,
    private navCtrl: NavController,
    private navParams: NavParams,
    private clipboard: Clipboard,
    private toastCtrl: ToastController,
    private cache: CacheService) {

    this.child = navParams.get('child');
    this.famId = navParams.get('famid');

    this.limitations = this.child.limits;
    this.childImg = this.child.img;
  }

  addToClipboard() {
    this.clipboard.copy(this.child.token).then(() => {

      this.toastCtrl.create({
        message: `Kopiert!`,
        duration: 2000,
        position: `top`,
        cssClass: "greenToastStyle"
      });
    });
  }

  deleteChild(child?: Child) {
    //Delete child from family
  }

  changePicture() {
    const options: CameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(imageData => {
      if (imageData) {
        this.base64Img = imageData;
        this.childImg = "data:image/jpeg;base64," + this.base64Img;
      }
      return imageData;
    }).catch(err => console.log(err));
  }

  async saveChanges() {
    if (this.base64Img) {
      const imgRef = `${this.afAuth.auth.currentUser.uid}_${new Date().getTime()}.jpeg`
      console.log("saving")
      await this.dbProvider.uploadImg(this.base64Img, imgRef).then(url => {
        this.child.img = url;
      })
    }

    this.changes = true
    await this.dbProvider.getCurrentUser().first().subscribe(user => {

      this.dbProvider.updateChild(this.child, this.child.id, user.familyId).then(() => {
        this.toastCtrl.create({
          duration: 5000,
          position: "top",
          message: "Endringene er lagret!",
          cssClass: "greenToastStyle",
          showCloseButton: true,
          closeButtonText: "Lukk"

        }).present().then(() => {
          this.cache.clearGroup('family');
          this.navCtrl.pop();
        })
      })
    })
  }

  addLimitToChild() {
    if (this.child.limits) {
      this.child.limits.push(this.limit);

    } else {
      this.child.limits = [this.limit];
    }
    this.limitations = this.child.limits;

    this.limit = ""
  }

  removeLimitations(limit: string) {
    this.child.limits = this.child.limits.filter(limitInArray => limitInArray !== limit)
    this.limitations = this.child.limits
  }

  delete() {
    this.changes = true;
    this.dbProvider.getCurrentUser().first().subscribe(user => {
      this.dbProvider.deleteChild(this.child, user.familyId);
      this.toastCtrl.create({
        duration: 5000,
        position: `top`,
        message: `${this.child.name} har blitt slettet fra din familie`,
        cssClass: "redToastStyle",
        showCloseButton: true,
        closeButtonText: "Lukk"
      }).present().then(() => this.navCtrl.pop());
    })
  }

  ionViewWillLeave() {
    console.log(this.changes)
    if (!this.changes) {
      this.toastCtrl.create({
        duration: 3000,
        position: `top`,
        message: `Endringene ble ikke lagret`,
        cssClass: "redToastStyle",
        showCloseButton: true,
        closeButtonText: "Lukk"
      }).present().then(() => { this.cache.clearGroup("family"); this.navCtrl.pop(); });
    }
  }
  
}
