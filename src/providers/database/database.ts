import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Rx';
import { QuerySnapshot, QueryDocumentSnapshot } from '@firebase/firestore-types';
import * as _ from 'lodash';
import { Child } from '../../models/child';
import { AngularFireAuth } from 'angularfire2/auth';
 

import firebase from 'firebase/app';
import { User } from '../../models/user';

@Injectable()
export class DatabaseProvider {
  membersDocId;
  constructor(public afs: AngularFirestore, private afAuth: AngularFireAuth) { 
    
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

        result.docs.filter(item => {

          const doesNotIncludeFilteredKeyWords = _.some(_.keys(item), key => {

            _.forEach(filterKeyWords, (fKey) => {

              return !_.includes(_.upperCase(item[key]), _.upperCase(fKey))
            });
          })

          return doesNotIncludeFilteredKeyWords;
        })
        filteredResult = result.docs;
      })
      return filteredResult;
    }

    if (!startAt && filterKeyWords) {

      const resultPromise = marketplaceRef.limit(numberOfItemsToGet).get();

      resultPromise.then(result => {

        result.docs.filter(item => {

          const doesNotIncludeFilteredKeyWords = _.some(_.keys(item), key => {

            _.forEach(filterKeyWords, (fKey) => {

              return !_.includes(_.upperCase(item[key]), _.upperCase(fKey))
            });
          })

          return doesNotIncludeFilteredKeyWords;
        })
        filteredResult = result.docs;
      })
      return filteredResult;
    }

    return marketplaceRef.limit(numberOfItemsToGet).get();

  }

  getUser(): firebase.User {
    return this.afAuth.auth.currentUser;
  }

   addChildtoFamily(child: Child, user: firebase.User) {
    let famId: string;

    let userObser = this.getUserFromDatabase(user);
     userObser.subscribe( (result) => {
       let data: User = result.payload.data() as User;
       
      famId = data.familyId;
      this.afs.collection('families').doc(famId).collection(`members`).add(child);
    })

  
  }
  getChildrenOfFamily(famID: string): Child[] {

    let children:Child[]=[];
     this.afs.collection(`families`)
    .doc(famID)
    .collection(`members`)
    .ref.where("tag","==","child").get().then(result =>{
      result.forEach((child)=>{
        console.log(child.data());
        children.push(child.data() as Child)
      })
    
    })
    return children;
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
  getUserFromDatabase(user) {

    return this.afs.collection('users')
      .doc(this.afAuth.auth.currentUser.uid).snapshotChanges();


  }
  getAdultsOfFamily(famID: string): User[] {
    console.log("Hello")
    let adults:User[]=[];
     this.afs.collection(`families`)
    .doc(famID)
    .collection(`members`)
    .ref.get().then(result =>{
      result.forEach((adult)=>{

        console.log(adult.data());
        console.log(adult.data());
        if(adult.data().email){
          adults.push(adult.data() as User)
        }
      })
    
    })
    console.log("Done")
    console.log(adults)
    return adults;
  }
}

