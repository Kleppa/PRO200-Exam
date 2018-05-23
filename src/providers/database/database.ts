import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Rx';
import { User } from '@firebase/auth-types';
import { QuerySnapshot, QueryDocumentSnapshot } from '@firebase/firestore-types';
import * as _ from 'lodash';
import { Child } from '../../models/child';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class DatabaseProvider {
  membersDocId;
  constructor(public afs: AngularFirestore,private afAuth: AngularFireAuth) { }

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
  getItemsFromDatabase(numberOfItemsToGet:number,startAt?:number,filterKeyWords?:string[]){
    const marketplaceRef = this.afs.collection(`Marketplace`).ref;
    let filteredResult:QueryDocumentSnapshot[];

    if(startAt && !filterKeyWords){
      return marketplaceRef.limit(numberOfItemsToGet).startAt(startAt).get();
    }

    if(startAt && filterKeyWords){
      let filteredResult:QueryDocumentSnapshot[];
      const resultPromise = marketplaceRef.limit(numberOfItemsToGet).startAt(startAt).get();

      resultPromise.then(result =>{

        result.docs.filter(item=>{

            const doesNotIncludeFilteredKeyWords = _.some(_.keys(item),key =>{

              _.forEach(filterKeyWords,(fKey)=>{

                return !_.includes(_.upperCase(item[key]),_.upperCase(fKey))
              });
            })
            
            return doesNotIncludeFilteredKeyWords;
        })
        filteredResult=result.docs;
      })
      return filteredResult;
    }
    
    if(!startAt && filterKeyWords){
      
      const resultPromise = marketplaceRef.limit(numberOfItemsToGet).get();

      resultPromise.then(result =>{

        result.docs.filter(item=>{

            const doesNotIncludeFilteredKeyWords = _.some(_.keys(item),key =>{

              _.forEach(filterKeyWords,(fKey)=>{

                return !_.includes(_.upperCase(item[key]),_.upperCase(fKey))
              });
            })
            
            return doesNotIncludeFilteredKeyWords;
        })
        filteredResult=result.docs;
      })
      return filteredResult;
    }

    return marketplaceRef.limit(numberOfItemsToGet).get();

  }

  getUser(email:string):User{
    return this.afAuth.auth.currentUser;
  }

  addChildtoFamily(child:Child,user:User){
    let famId:string;

    this.getFamilyId(user).subscribe(result => famId=result)

    this.afs.collection('families').doc(famId).collection(`members`).add(child);

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
  getFamilyId(user){
    return this.afs.collection('users')
    .doc(this.afAuth.auth.currentUser.uid).snapshotChanges()

    .map(actions=> {

      return actions.payload.data().familyId;

      })
    }
  }

