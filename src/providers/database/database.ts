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

@Injectable()

export class DatabaseProvider {
  membersDocId;
  familyMembers: Observable<firebase.firestore.DocumentData[]>;

  constructor(public afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage) {

      this.setUpFamilyObservables();

  }

  addDocToColl(data: any, collection: string) {
    this.afs.collection(collection).add(data);
  }
  setUpFamilyObservables(){

    if (this.afAuth.auth.currentUser) {
      
      this.familyMembers = this.afs.collection('users')
        .doc<User>(this.afAuth.auth.currentUser.uid)
        .valueChanges()
        .map(user => user.familyId)
        .switchMap(familyId => 
          familyId
          ? this.afs.collection('families').doc(familyId).collection('members').snapshotChanges()
            .map(actions =>
              actions.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                console.log({id,...data})
                return { id, ...data };
              })
            )
          : Observable.empty());
          console.log(this.familyMembers)
    }
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
      .then(childRef => this.afs.collection('children').doc(childRef.id).set({ ...child, familyId }));
  }

  addUserProfile(user): Promise<void> {
    return this.afs.collection('users')
      .doc(this.afAuth.auth.currentUser.uid)
      .set(user);
  }

  giveUserFamilyId(user:User, famId?:string){
    user.familyId = this.membersDocId ? this.membersDocId : famId;
    console.log(user)
    return this.afs.collection('users').ref.where("email","==",user.email).get().then(usersFromQuery =>{
      usersFromQuery.forEach(val => {
        this.afs.collection(`users`).doc(val.id).update(user).then(()=>{
          this.setUpFamilyObservables();
          console.log("Setting up obs")
        });
      })
    })
  }

  addUserToFamily(user): Promise<void> {
    console.log(user)
    this.membersDocId = this.afs.createId();
    
    return this.afs.collection('families')
      .doc(this.membersDocId)
      .collection('members')
      .doc(this.afAuth.auth.currentUser.uid)
      .set(user);
  }
  addUser(user:User,famid:string){
    console.log(user)
    return this.afs.collection('families')
    .doc(famid)
    .collection('members')
    .add(user).catch(err=>console.error(err));
  }

  getCurrentUser(): Promise<User> {
    return this.afs.collection('users')
      .doc(this.afAuth.auth.currentUser.uid)
      .ref.get()
      .then(result => { return (result.exists) ? result.data() as User : null });
  }

  getFamilyMembers() {
    return this.familyMembers ? this.familyMembers : Observable.empty();
  }

  uploadImg(imgBase64: string, imgRef: string): AngularFireUploadTask {
    return this.afStorage.ref(imgRef).putString(imgBase64, `base64`, { contentType: `image/jpeg` });
  }

  updateChild(child: Child, docid: string, famid: string):Promise<void> {
    console.log("familyid", famid)
    return this.afs.collection(`families`).doc(famid).collection(`members`).doc(docid).update(child).then(() => {
      this.afs.collection(`children`).doc(docid).update(child);
    })
  }
  deleteChild(child: Child, famid: string): Promise<void> {
    return this.afs.collection(`families`).doc(famid).collection(`members`).doc(child.id).delete().then(() => {
      this.afs.collection(`children`).doc(child.id).delete();
    })
  }
  deleteAdult(user:{},famId?:string):Promise<void> {
    console.log("deleting",user)
    const fId = famId ? famId : user[`familyId`];
    console.log(...(_.toArray(user)))
    console.log(fId)

    return this.afs.collection(`families`).doc(fId).collection(`members`).
    ref.where("email","==",user['email']).get().then((userFound)=>{

      userFound.forEach(doc=>{
        
        this.afs.collection(`families`).doc(fId).collection(`members`).doc(doc.id).delete().then(()=>{
          
          this.afs.collection(`users`).ref.where("email","==",doc.data()[`email`]).get().then(user =>{
            user.forEach(u=>{
              this.afs.collection(`users`).doc(u.id).update({
                familyId: firebase.firestore.FieldValue.delete()
    
              })
            })
          })
        })
      })
    })
  }
   findUser(email:string):Promise<QuerySnapshot>{
 
    console.log("email", email)
    return this.afs.collection('users').ref
    .where("email","==",email).get();
  
  }

}
