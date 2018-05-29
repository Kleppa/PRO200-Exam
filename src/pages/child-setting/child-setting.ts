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
  private famId;
  constructor(private afAuth: AngularFireAuth, private dbProvider: DatabaseProvider, private camera: Camera, private navCtrl: NavController, private navParams: NavParams, private clipboard: Clipboard, private toastCtrl: ToastController) {

    this.child = navParams.get('child');
    this.famId = navParams.get('famid');

    this.limitations = this.child.limits;
    this.childImg=this.child.img;

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
     
      if (imageData) {

        this.base64Img = imageData;

        this.childImg =  "data:image/jpeg;base64," + this.base64Img;
        
      }
      return imageData;

    }).catch(err => console.log(err));
  }
  async saveChanges() {

    if (this.base64Img) {

      const imgRef = `${this.afAuth.auth.currentUser.uid}_${new Date().getTime()}.jpeg`
      
     await this.dbProvider.uploadImg(this.base64Img, imgRef)
        .then(task => task.ref.getDownloadURL().then(url => this.child.img = url));
    }

    await this.dbProvider.updateChild(this.child, this.child.id ,this.famId).then(()=>{
      this.toastCtrl.create({
        duration:3000,
        position:"top",
        message:"Endringene er lagret!"
      }).present().then(()=>{
        this.navCtrl.pop();
      })
    });
    
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
  removeLimitations(limit:string){
    this.child.limits = this.child.limits.filter(limitInArray=>limitInArray!==limit)
    this.limitations = this.child.limits
  }
}
