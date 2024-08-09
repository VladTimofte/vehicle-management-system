import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IStorageService } from '@src/app/models/common';
import { History } from '../../models/history.model';
import { StorageFactory } from '../storage/storage.factory';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  public storageFactory: IStorageService<History>;

  constructor() {
    // Call createStorage with the type argument Employee
    this.storageFactory = StorageFactory.createStorage<History>();
    this.storageFactory.setKey('history');
  }

  // Link existing functions to the new common service
  getHistoryObservable(): Observable<History[]> {
    return this.storageFactory.getItemsObservable();
  }

  addHistory(history: History) {
    this.storageFactory.addOrUpdateItem(history);
  }

  getHistory(): History[] {
    return this.storageFactory.getItems();
  }

}
