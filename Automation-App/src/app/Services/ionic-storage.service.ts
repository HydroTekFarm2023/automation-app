import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IonicStorageService {

  constructor() { }

  public set(key: string, data: any): Observable<any> {
    let JSONStringData = JSON.stringify(data);
    return from(Plugins.Storage.set({ key: key, value: JSONStringData }));
  }

  public get(key: string): Observable<any> {
    Plugins.Storage.keys().then((data) => console.log(data));
    return from(Plugins.Storage.get({ key: key})).pipe(map(data => { return JSON.parse(data.value) }));
  }

  public remove(key: string): Observable<any> {
    return from(Plugins.Storage.remove({ key: key }));
  }

  public clear() {
    return from(Plugins.Storage.clear()).pipe(tap(() => console.log('all keys cleared')));
  }
}
