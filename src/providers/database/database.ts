import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { User } from '@firebase/auth-types';

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
  
}
