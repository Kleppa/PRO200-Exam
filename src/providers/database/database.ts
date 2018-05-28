import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Rx';
import { QuerySnapshot, QueryDocumentSnapshot } from '@firebase/firestore-types';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import * as _ from 'lodash';
import { Child } from '../../models/child';
import { AngularFireAuth } from 'angularfire2/auth';

import firebase from 'firebase/app';
import { User } from '../../models/user';

@Injectable()
export class DatabaseProvider {
  membersDocId;
  familyMembers: Observable<firebase.firestore.DocumentData[]>;

  constructor(public afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage) {
      
    if (this.afAuth.auth.currentUser.uid) {
      this.familyMembers = this.afs.collection('users')
        .doc<User>(this.afAuth.auth.currentUser.uid)
        .valueChanges()
        .map(user => user.familyId)
        .switchMap(familyId => familyId
          ? this.afs.collection('families').doc(familyId).collection('members').valueChanges()
          : Observable.empty());
    }

  }

  addDocToColl(data: any, collection: string) {
    this.afs.collection(collection).add(data);
  }

  getDataFromColl(collection: string) {
    return this.afs.collection(collection).snapshotChanges()
      .map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data }
      }))
  }

  getItemsFromDatabase(numberOfItemsToGet: number, startAt?: number, filterKeyWords?: string[]) {
    const marketplaceRef = this.afs.collection(`Marketplace`).ref;
    let filteredResult: QueryDocumentSnapshot[];

    if (startAt && !filterKeyWords) {
      return marketplaceRef.limit(numberOfItemsToGet).startAt(startAt).get();
    }

    if (startAt && filterKeyWords) {
      let filteredResult: QueryDocumentSnapshot[];
      const resultPromise = marketplaceRef.limit(numberOfItemsToGet).startAt(startAt).get();

      resultPromise.then(result => {

        filteredResult = result.docs.filter(item => {

          const doesNotIncludeFilteredKeyWords = _.some(_.keys(item), key => {

            _.forEach(filterKeyWords, (fKey) => {

              return !_.includes(_.upperCase(item[key]), _.upperCase(fKey))
            });
          })

          return doesNotIncludeFilteredKeyWords;
        })

      })
      return filteredResult;
    }

    if (!startAt && filterKeyWords) {

      const resultPromise = marketplaceRef.limit(numberOfItemsToGet).get();

      resultPromise.then(result => {

        filteredResult = result.docs.filter(item => {

          const doesNotIncludeFilteredKeyWords = _.some(_.keys(item), key => {

            _.forEach(filterKeyWords, (fKey) => {

              return !_.includes(_.upperCase(item[key]), _.upperCase(fKey))
            });
          })

          return doesNotIncludeFilteredKeyWords;
        })

      })
      return filteredResult;
    }
    return marketplaceRef.limit(numberOfItemsToGet).get();
  }

  addChildtoFamily(child: Child, familyId: string): Promise<void> {
    return this.afs.collection('families').doc(familyId).collection(`members`).add(child)
      .then(childRef => this.afs.collection('children').doc(childRef.id).set(child));
  }

  addUserProfile(user): Promise<void> {
    user.familyId = this.membersDocId;

    return this.afs.collection('users')
      .doc(this.afAuth.auth.currentUser.uid)
      .set(user);
  }

  addUserToFamily(user): Promise<void> {
    this.membersDocId = this.afs.createId();

    return this.afs.collection('families')
      .doc(this.membersDocId)
      .collection('members')
      .doc(this.afAuth.auth.currentUser.uid)
      .set(user);
  }

  getCurrentUser(): Promise<User> {
    return this.afs.collection('users')
      .doc(this.afAuth.auth.currentUser.uid)
      .ref.get()
      .then(result => { return (result.exists) ? result.data() as User : null });
  }

  getFamilyMembers() {
    return this.familyMembers;
  }

  uploadImg(imgBase64: string, imgRef: string): AngularFireUploadTask {
    return this.afStorage.ref(imgRef).putString(imgBase64, `base64`, { contentType: `image/jpeg` });
  }
  updateChild(child:Child){

  
  }

}
