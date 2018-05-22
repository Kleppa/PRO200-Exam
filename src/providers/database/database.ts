import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Rx';
import { User } from '@firebase/auth-types';
import { QuerySnapshot, QueryDocumentSnapshot } from '@firebase/firestore-types';
import * as _ from 'lodash';

@Injectable()
export class DatabaseProvider {

  constructor(public afs: AngularFirestore) { }

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
}
