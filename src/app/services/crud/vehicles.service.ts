import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';

import { Vehicle } from '../../models/vehicle.model';
import { StorageFactory } from '../storage/storage.factory';
import { IStorageService } from '@src/app/models/common';
import { HistoryService } from './history.service';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class VehiclesService {
  public storageFactory: IStorageService<Vehicle>;
  public historyService = inject(HistoryService);
  public auth = inject(AuthService);

  constructor() {
    // Call createStorage with the type argument Vehicle
    this.storageFactory = StorageFactory.createStorage<Vehicle>();
    this.storageFactory.setKey('vehicles');
  }

  // Link existing functions to the new common service
  getVehiclesObservable(): Observable<Vehicle[]> {
    return this.storageFactory.getItemsObservable();
  }

  addOrUpdateVehicle(vehicle: Vehicle) {
    this.storageFactory.addOrUpdateItem(vehicle);
    this.historyService.addHistory({
      id: uuidv4(),
      user: this.auth.getUserProfile()?.name as string,
      action: this.resourceExists(vehicle) ? 'UPDATE' : 'ADD',
      entity: 'VEHICLE',
      resource: vehicle.plateNumber,
      date: DateTime.now().toMillis(),
    });
    console.log('USER', this.auth.getUserProfile())
  }

  removeVehicle(id: string) {
    const vehicle = this.getVehicles().find((el) => el?.id === id);
    if (vehicle) {
      this.historyService.addHistory({
        id: uuidv4(),
        user: this.auth.getUserProfile()?.name as string,
        action: "DELETE",
        entity: 'VEHICLE',
        resource: vehicle.plateNumber,
        date: DateTime.now().toMillis(),
      });
    }
    this.storageFactory.removeItem(id);
  }

  getVehicles(): Vehicle[] {
    return this.storageFactory.getItems();
  }

  resourceExists(data: Vehicle): boolean {
    const existingIndex = this.getVehicles().findIndex(
      (item) => item?.id === data?.id
    );

    if (existingIndex !== -1) {
      return true;
    } else {
      return false;
    }
  }
}
