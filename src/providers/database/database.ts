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

@Injectable()

export class DatabaseProvider {
  membersDocId;

  constructor(public afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage) { }

  addDocToColl(data: any, collection: string) {
    this.afs.collection(collection).add(data);
  }

  getDataFromColl(collection: string) {
    return this.afs.collection(collection).snapshotChanges()
      .map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data }
      }));
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
      .then(childRef => this.afs.collection('children').doc(childRef.id).set({ ...child, familyId }));
  }

  addUserProfile(user): Promise<void> {
    return this.afs.collection('users')
      .doc(this.afAuth.auth.currentUser.uid)
      .set(user);
  }
  getFamilyWishes(famId: string): Observable<DocumentData[]> {

    return this.afs.collection(`families`).doc(famId).collection(`wishlist`).snapshotChanges()
      .map(actions => actions.map(a => {

        const data = a.payload.doc.data() as Item;
        const id = a.payload.doc.id;

        return { id, ...data }
      }))
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
    return this.afAuth.user.first()
      .map(user => user.uid)
      .switchMap(id =>
        Observable.fromPromise(this.afs.collection('users')
          .doc(id).ref.get()
          .then(result => (result.exists) ? result.data() as User : null)));
  }

  getFamilyMembers() {
    return this.afAuth.user.first()
      .map(user => user.uid)
      .switchMap(userId => this.afs.collection('users')
        .doc<User>(userId).valueChanges()
        .map(user => user.familyId)
        .switchMap(familyId =>
          (familyId)
            ? this.afs.collection('families').doc(familyId).collection<any>('members').snapshotChanges()
              .map(actions =>
                actions.map(a => {
                  const data = a.payload.doc.data();
                  const id = a.payload.doc.id;
                  return { id, ...data };
                }))
            : Observable.empty()));
  }

  uploadImg(imgBase64: string, imgRef: string): Promise<any> {
    return this.afStorage.ref(imgRef).putString(imgBase64, `base64`, { contentType: `image/jpeg` })
      .then(task => { return task.ref.getDownloadURL() });
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
    const fId = famId ? famId : user[`familyId`];

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
    return this
      .getFamilyMembers()
      .map(members => members.filter(member => member.tag == 'child'));
  }

  getAdults(): Observable<DocumentData[]> {
    return this
      .getFamilyMembers()
      .map(members => members.filter(member => !member.tag));
  }

}
