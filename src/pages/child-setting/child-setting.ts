import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Child } from '../../models/child';
import * as shortid from 'shortid'
import { Clipboard } from '@ionic-native/clipboard';
import { ToastController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireAuth } from 'angularfire2/auth';
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
  public limitations:string[];
  constructor(private afAuth: AngularFireAuth, private dbProvider: DatabaseProvider, private camera: Camera, private navCtrl: NavController, private navParams: NavParams, private clipboard: Clipboard, private toastCtrl: ToastController) {

    this.child = navParams.get('child');
    this.limitations = this.child.limits;
    this.childImg=this.child.img;
    if (this.child) {
      console.log(this.child)
    }


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChildSettingPage');
  }

  addToClipboard() {
    this.clipboard.copy(this.child.token).then(() => {

      this.toastCtrl.create({

        message: `Kopiert!`,
        duration: 1500,
        position: `top`

      });
    });
  }
  deleteChild(child?: Child) {
    //Delete child from family
  }
  changePicture() {
    const options = {
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      destinationType: this.camera.DestinationType.DATA_URL,
      mediaType: this.camera.MediaType.ALLMEDIA,
    };

    this.camera.getPicture(options).then(imageData => {

      //data:image/jpeg;base64,
     
      if (imageData) {

        this.base64Img = imageData;

        this.childImg =  "data:image/jpeg;base64," + this.base64Img;
        
      }
      return imageData;

    }).catch(err => console.log(err));
  }
  saveChanges() {

    if (this.base64Img) {

      const imgRef = `${this.afAuth.auth.currentUser.uid}_${new Date().getTime()}.jpeg`
      
      this.dbProvider.uploadImg(this.base64Img, imgRef)
        .then(task => task.ref.getDownloadURL().then(url => this.child.img = url)).then(()=>{
          this.dbProvider.updateChild(this.child);
        })
    }
  }
  addLimitToChild(){

    if(this.child.limits){
      this.child.limits.push(this.limit);
      
    }else{
      this.child.limits=[this.limit];
    }
    this.limitations=this.child.limits;

    this.limit=""
  }
}
