import { HasId, IStorageService } from '@src/app/models/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export class LocalStorageService<T extends HasId>
  implements IStorageService<T>
{
  public key!: string;
  protected items: T[] = []; // Can be used mockData
  private itemsSubject = new BehaviorSubject<T[]>([]);

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

  getItemsObservable():Observable<T[]> {
    return this.itemsSubject.asObservable();
  }

  setKey(key: string): void {
    this.key = key;
    this.loadItems()
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
