import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  query,
  where,
  setDoc,
  getDocs,
  CollectionReference,
} from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Observable, BehaviorSubject } from 'rxjs';
import { HasId, IStorageService } from '@src/app/models/common';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageService<T extends HasId>
  implements IStorageService<T>
{
  public key!: string;
  protected items: T[] = []; // Can be used mockData
  private itemsSubject = new BehaviorSubject<T[]>([]);
  private itemCollection!: CollectionReference;
  private itemsLoaded: boolean = false;

  private firestore: Firestore = inject(Firestore);

  getItems(): T[] {
    this.loadItems();
    return this.items;
  }

  async removeItem(id: string) {
    try {
      // Creează interogarea pentru a găsi documentul cu câmpul `id` egal cu `id`
      const q = query(this.itemCollection, where('id', '==', id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Documentul găsit, șterge-l
        const docRef = querySnapshot.docs[0].ref;
        await deleteDoc(docRef);
        console.log('Document removed successfully');
      } else {
        console.log('No document found with the specified id');
      }
    } catch (e) {
      console.error('Error removing document: ', e);
    }
    this.itemsLoaded = false;
    this.loadItems();
  }

  async addOrUpdateItem(item: T) {
    try {
      // Creează interogarea pentru a găsi documentul pe baza câmpului id
      const q = query(this.itemCollection, where('id', '==', item.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Documentul există, actualizează-l
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, item, { merge: true });
        console.log('Document updated successfully');
      } else {
        // Documentul nu există, creează unul nou
        await addDoc(this.itemCollection, {
          ...item,
          id: uuidv4(),
        });
        console.log('Document added successfully');
      }
    } catch (e) {
      console.error('Error adding/updating document: ', e);
    }
    this.itemsLoaded = false;
    this.loadItems();
  }

  getItemsObservable(): Observable<T[]> {
    return this.itemsSubject.asObservable();
  }

  setKey(key: string): void {
    this.key = key;
  }

  public async loadItems() {
    if (this.itemsLoaded) return;
    this.itemsLoaded = true;

    this.itemCollection = collection(this.firestore, this.key);
    try {
      const querySnapshot = await getDocs(this.itemCollection);
      this.items = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as T[];
      this.itemsSubject.next([...this.items]);
      console.log('Items loaded successfully', this.items);
    } catch (e) {
      console.error('Error loading items: ', e);
    }
  }
}
