import { HasId, IStorageService } from '@src/app/models/common';
import { inject } from '@angular/core';
import { History } from '@src/app/models/history.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { HistoryService } from '../crud/history.service';

export class LocalStorageService<T extends HasId>
  implements IStorageService<T>
{
  public key!: string;
  protected items: T[] = [];
  private itemsSubject = new BehaviorSubject<T[]>([]);
  // public historyService = inject(HistoryService)

  constructor() {
    this.loadItems();
  }

  loadItems() {
    const data = localStorage.getItem(this.key);
    const parsedData = data ? JSON.parse(data) : null;

    if (parsedData?.length) {
      this.items = parsedData;
    }
    this.itemsSubject.next([...this.items]);
    this.saveItems();
  }

  getItems(): T[] {
    return this.items;
  }

  removeItem(id: string): void {
    this.items = this.items.filter((i) => i.id !== id);
    this.itemsSubject.next([...this.items]);
    this.saveItems();
    // this.historyService.addHistory({
    //   id: uuidv4(),
    //   user: 'USER',
    //   action: 'delete',
    //   entity: 'ENTITY',
    //   resource: 'RESOURCE',
    //   date: 123123123123,
    // })
  }

  addOrUpdateItem(item: T): void {
    const existingIndex = this.findIndexById(item.id);

    if (existingIndex !== -1) {
      this.updateItem(existingIndex, item);
    } else {
      this.addNewItem(item);
    }

    this.saveItems();
  }

  getItemsObservable(): Observable<T[]> {
    return this.itemsSubject.asObservable();
  }

  setKey(key: string): void {
    this.key = key;
    this.loadItems();
  }

  private findIndexById(id: string): number {
    return this.items.findIndex((item) => item.id === id);
  }

  private updateItem(index: number, item: T) {
    this.items[index] = { ...item };
    this.itemsSubject.next([...this.items]);
  }

  private addNewItem(item: T) {
    const newItem = { ...item, id: uuidv4() } as T;
    this.items.unshift(newItem);
    this.itemsSubject.next([...this.items]);
  }

  private saveItems() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
  }
}
