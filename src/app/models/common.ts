import { Observable } from "rxjs";

export interface HasId {
  id: string;
}

export interface IStorageService<T> {
  getItems(): T[];
  removeItem(id: string): void;
  addOrUpdateItem(item: T): void;
  getItemsObservable(): Observable<T[]>;
  setKey(key: string): void;
}

export interface AppConfig {
  storage: string;
}
