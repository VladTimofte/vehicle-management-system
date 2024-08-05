import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Vehicle } from '../../models/vehicle.model';
import { StorageFactory } from '../storage/storage.factory';
import { IStorageService } from '@src/app/models/common';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  public storageFactory: IStorageService<Vehicle>;

  constructor() {
    // Call createStorage with the type argument Vehicle
    this.storageFactory = StorageFactory.createStorage<Vehicle>();
    this.storageFactory.setKey('vehicles')
  }

  // Link existing functions to the new common service
  getVehiclesObservable(): Observable<Vehicle[]> {
    return this.storageFactory.getItemsObservable();
  }

  addOrUpdateVehicle(vehicle: Vehicle) {
    this.storageFactory.addOrUpdateItem(vehicle);
  }

  removeVehicle(id: string) {
    this.storageFactory.removeItem(id);
  }

  getVehicles(): Vehicle[] {
    return this.storageFactory.getItems();
  }
}
