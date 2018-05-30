import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Child } from '../../models/child';
import { Camera } from '@ionic-native/camera'
import { AngularFireAuth } from 'angularfire2/auth';

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
    public navCtrl: NavController,
    public navParams: NavParams,
    private dbProvider: DatabaseProvider,
    private afAuth: AngularFireAuth,
    private camera: Camera) { }

  cancel() {
    this.navCtrl.pop();
  }

  async addChildToFamily() {
    await this.dbProvider.getCurrentUser().then(async (user)=>{
      if(!user.familyId){
        await this.dbProvider.addUserToFamily(user);
        await this.dbProvider.giveUserFamilyId(user);
      }
    })
    if (!(this.child.name || this.child.age)) {
      this.presentFailureToast()
    } else {
      this.child.tag = "child";
      this.attachToken();

      if (this.base64Img) {
        const imgRef = `${this.afAuth.auth.currentUser.uid}_${new Date().getTime()}.jpeg`
        this.dbProvider.uploadImg(this.child.img, imgRef)
          .then(task => task.ref.getDownloadURL().then(url => this.child.img = url));
      }

      this.dbProvider.getCurrentUser()
        .then(user => this.dbProvider.addChildtoFamily(this.child, user.familyId))
        .then(() => {
          console.info('Added child to family', this.child)
          this.presentSuccessToast();
          this.navCtrl.pop();
        })
        .catch(reason => {
          console.error('Failed adding child to family', reason);
          this.presentFailureToast();
        });
    }
  }

  openGallery() {

    const options = {
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      destinationType: this.camera.DestinationType.DATA_URL,
      mediaType: this.camera.MediaType.ALLMEDIA,
    };

    this.camera.getPicture(options).then(imageData => {

      //data:image/jpeg;base64,

      return imageData;

    }).then(imageBase64 => {
      if (imageBase64) {
        this.base64Img = imageBase64;
      }
    }).catch(err=>console.log(err))
  }

  attachToken() {
    if (!this.child.token) {
      this.child.token = Math.random().toString(36).substr(2, 6).toUpperCase();
    }
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
  getStyle(): {} {

    if (this.base64Img) {
      this.btnText = "";
    } else {
      this.btnText = "+"
    }

    return {

      'background-image': this.base64Img ? `url(data:image/jpeg;base64,${this.base64Img})` : "",
      'background-size': "cover"
    }
  }

}
