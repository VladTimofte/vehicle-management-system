import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

interface HasId {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export abstract class DB<T extends HasId> {

  private itemsSubject = new BehaviorSubject<T[]>([]);
  protected items: T[] = [];
  private readonly LS_KEY: string;

  constructor(lsKey: string, initialData: T[]) {
    this.LS_KEY = lsKey;
    this.items = initialData;

    const data = localStorage.getItem(this.LS_KEY);
    const parsedData = data ? JSON.parse(data) : null;

    if (parsedData?.length) {
      this.items = parsedData;
    }
    this.itemsSubject.next([...this.items]);
    this.saveItems();
  }

  getItemsObservable(): Observable<T[]> {
    return this.itemsSubject.asObservable();
  }

  addOrUpdateItem(item: T) {
    const existingIndex = this.findIndexById(item.id);

    if (existingIndex !== -1) {
      this.updateItem(existingIndex, item);
    } else {
      this.addNewItem(item);
    }

    this.saveItems();
  }

  removeItem(id: string) {
    this.items = this.items.filter(i => i.id !== id);
    this.itemsSubject.next([...this.items]);
    this.saveItems();
  }

  private findIndexById(id: string): number {
    return this.items.findIndex(item => item.id === id);
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
    localStorage.setItem(this.LS_KEY, JSON.stringify(this.items));
  }

  getItems(): T[] {
    return this.items;
  }
}
