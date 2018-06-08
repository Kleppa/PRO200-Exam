import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentData } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Rx';
import { QuerySnapshot, QueryDocumentSnapshot } from '@firebase/firestore-types';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import * as _ from 'lodash';
import { Child } from '../../models/child';
import { AngularFireAuth } from 'angularfire2/auth';

import firebase from 'firebase/app';
import { User } from '../../models/user';
import { Item } from '../../models/item';
import { UploadTaskSnapshot } from 'angularfire2/storage/interfaces';
import { CacheService } from 'ionic-cache';
import { map } from '@firebase/util';

@Injectable()

export class DatabaseProvider {
  membersDocId;

  constructor(public afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage,
    private cache: CacheService) { }

  private getFamilyMembers(): Observable<any[]> {
    return this.afAuth.user.first()
      .map(user => user.uid)
      .switchMap(userId => this.afs.collection('users')
        .doc<User>(userId).valueChanges()
        .filter(user => (user.familyId) ? true : false)
        .map(user => user.familyId)
        .switchMap(familyId => (familyId)
          ? this.afs.collection('families').doc(familyId).collection<any>('members').snapshotChanges()
            .map(actions =>
              actions.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                return { id, ...data };
              }))
          : Observable.empty()));
  }

  addChildtoFamily(child: Child, familyId: string): Promise<void> {
    return this.afs.collection('families').doc(familyId).collection(`members`).add(child)
      .then(childRef => this.afs.collection('children').doc(childRef.id).set({ ...child, familyId }));
  }

  addUserProfile(user): Promise<void> {
    return this.afs.collection('users')
      .doc(this.afAuth.auth.currentUser.uid)
      .set(user);
  }

  getFamilyWishes(): Observable<Item[]> {
    return this.getCurrentUser().filter(user => (user.familyId) ? true : false)
      .map(user => user.familyId)
      .switchMap(familyId =>
        this.afs.collection(`families`).doc(familyId).collection(`wishlist`).snapshotChanges()
          .map(actions => actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data } as Item;
          })));
  }

  giveUserFamilyId(user: User, famId?: string) {
    user.familyId = this.membersDocId ? this.membersDocId : famId;
    return this.afs.collection('users').ref.where("email", "==", user.email).get().then(usersFromQuery => {
      usersFromQuery.forEach(val => {
        this.afs.collection(`users`).doc(val.id).update(user);
      });
    });
  }

  addUserToFamily(user: User): Promise<void> {
    this.membersDocId = this.afs.createId();

    return this.afs.collection('families')
      .doc(this.membersDocId)
      .collection('members')
      .doc(this.afAuth.auth.currentUser.uid)
      .set(user);
  }

  addUser(user: User, famid: string) {
    console.log(user)
    return this.afs.collection('families')
      .doc(famid)
      .collection('members')
      .add(user).catch(err => console.error(err));
  }

  getCurrentUser(): Observable<User> {
    return this.afAuth.authState.first()
      .map(user => user.uid)
      .switchMap(id =>
        Observable.fromPromise(this.afs.collection('users')
          .doc(id).ref.get()
          .then(result => {
            return (result.exists) ? result.data() as User : null
          })));
  }


  uploadImg(imgBase64: string, imgRef: string) {
    return this.afStorage.ref(imgRef)
      .putString(imgBase64, `base64`, { contentType: `image/jpeg` })
      .task.then(task => { return task.ref.getDownloadURL() });
  }

  updateChild(child: Child, docid: string, famid: string): Promise<void> {
    return this.afs.collection(`families`).doc(famid).collection(`members`).doc(docid).update(child).then(() => {
      this.afs.collection(`children`).doc(docid).update(child);
    });
  }

  deleteChild(child: Child, famid: string): Promise<void> {
    return this.afs.collection(`families`).doc(famid).collection(`members`).doc(child.id).delete().then(() => {
      this.afs.collection(`children`).doc(child.id).delete();
    })
  }

  deleteAdult(user: {}, famId?: string): Promise<void> {

    const fId = famId;

    
    return this.afs.collection(`families`).doc(fId).collection(`members`).
      ref.where("email", "==", user['email']).get().then((userFound) => {



        userFound.forEach(doc => {
     
          this.afs.collection(`families`).doc(fId).collection(`members`).doc(doc.id).delete().then(() => {

            this.afs.collection(`users`).ref.where("email", "==", doc.data()[`email`]).get().then(user => {
              user.forEach(u => {
                this.afs.collection(`users`).doc(u.id).update({
                  familyId: firebase.firestore.FieldValue.delete()

                })
              })
            })
          })
        })
      })
  }


  findUser(email: string): Promise<QuerySnapshot> {
    return this.afs.collection('users').ref
      .where("email", "==", email).get();
  }

  getChildren(): Observable<DocumentData[]> {
    let request = this
      .getFamilyMembers()
      .map(members => members.filter(member => member.tag == 'child'));
    return this.cache.loadFromObservable('family-children', request, 'family');
  }

  getAdults(): Observable<DocumentData[]> {
    let request = this
      .getFamilyMembers()
      .map(members => members.filter(member => !member.tag));
    return this.cache.loadFromObservable('family-adults', request, 'family');
  }

  addWishToCart(wish) {

    this.getCurrentUser().subscribe(user => {
      console.log(wish);
      this.afs.collection('families').doc(user.familyId).collection(`cart`).add(wish).then(() => {
        wish[`status`] = "godkjent"
        this.afs.collection('families').doc(user.familyId).collection(`wishlist`).ref.where(`EAN`, "==", wish[`EAN`]).get().then(docs => {
          docs.forEach(doc => {
            this.afs.collection('families').doc(user.familyId).collection(`wishlist`).doc(doc.id).update(wish);
            this.cache.clearGroup('wishes')
          })
        })
      })
    })
  }

  denyWish(wish) {
    console.log("DENYING WISH")
    this.getCurrentUser().subscribe(user => {
      this.afs.collection('families').doc(user.familyId).collection(`wishlist`).ref.where(`EAN`, "==", wish[`EAN`]).get().then(docs => {
        console.log("found doc")
        wish[`status`] = "ikke godkjent"
        docs.forEach(doc => {
          console.log("found doc")
          this.afs.collection('families').doc(user.familyId).collection(`wishlist`).doc(doc.id).update(wish);
        })
      })
    })
  }

  getCartItems(): Observable<Item[]> {
    return this.getCurrentUser().switchMap(user =>
      this.afs.collection('families').doc(user.familyId)
        .collection<Item>('cart').valueChanges()).do(item => item as Item[]);
  }
  getChildWishItems(child:Child): Observable<Item[]> {

    return this.getCurrentUser().switchMap(user =>
      this.afs.collection('families').doc(user.familyId)
        .collection<Item>('wishlist').valueChanges()).filter(item => item[`childToken`] === child.token);
  }
}
