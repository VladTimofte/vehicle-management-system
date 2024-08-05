import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IStorageService } from '@src/app/models/common';
import { Allocation } from '../../models/allocation.model';
import { Vehicle } from '../../models/vehicle.model';
import { VehiclesService } from './vehicles.service';
import { StorageFactory } from '../storage/storage.factory';

@Injectable({
  providedIn: 'root',
})
export class AllocationsService {
  public storageFactory: IStorageService<Allocation>;

  constructor(private vehiclesService: VehiclesService) {
    // Call createStorage with the type argument Employee
    this.storageFactory = StorageFactory.createStorage<Allocation>();
    this.storageFactory.setKey('allocations');
  }

  // Link existing functions to the new common service
  getAllocationsObservable(): Observable<Allocation[]> {
    return this.storageFactory.getItemsObservable();
  }

  addOrUpdateAllocation(allocation: Allocation) {
    this.storageFactory.addOrUpdateItem(allocation);
  }

  removeAllocation(id: string) {
    this.storageFactory.removeItem(id);
  }

  getAllocations(): Allocation[] {
    return this.storageFactory.getItems();
  }

  getAvailableVehicles(
    requestingEmployeeId: string,
    startDate: number,
    endDate: number
  ): Vehicle[] {
    return this.vehiclesService.getVehicles().filter((vehicle) => {
      const isAvailable = !this.getAllocations().some((allocation) => {
        if (allocation.vehicleId !== vehicle.id) {
          return false;
        }

        const overlaps = !(
          allocation.endDate < startDate || allocation.startDate > endDate
        );
        return (
          overlaps &&
          (requestingEmployeeId === undefined ||
            allocation.employeeId !== requestingEmployeeId)
        );
      });
      return isAvailable;
    });
  }
}
