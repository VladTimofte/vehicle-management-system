import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';

import { IStorageService } from '@src/app/models/common';
import { Allocation } from '../../models/allocation.model';
import { Vehicle } from '../../models/vehicle.model';
import { VehiclesService } from './vehicles.service';
import { StorageFactory } from '../storage/storage.factory';
import { HistoryService } from './history.service';
import { AuthService } from '../auth.service';
import { EmployeesService } from './employees.service';

@Injectable({
  providedIn: 'root',
})
export class AllocationsService {
  public storageFactory: IStorageService<Allocation>;
  public historyService = inject(HistoryService);
  public vehicleService = inject(VehiclesService);
  public employeeService = inject(EmployeesService);
  public auth = inject(AuthService);

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
    this.historyService.addHistory({
      id: uuidv4(),
      user: this.auth.getUserProfile()?.name as string,
      action: "ADD",
      entity: 'ALLOCATION',
      resource: this.historyAllocationString(allocation),
      date: DateTime.now().toMillis(),
    });
  }

  removeAllocation(id: string) {
    const allocation = this.getAllocations().find((el) => el?.id === id);
    if (allocation) {
      this.historyService.addHistory({
        id: uuidv4(),
        user: this.auth.getUserProfile()?.name as string,
        action: "DELETE",
        entity: 'ALLOCATION',
        resource: this.historyAllocationString(allocation),
        date: DateTime.now().toMillis(),
      });
    }
    this.storageFactory.removeItem(id);
  }

  getAllocations(): Allocation[] {
    return this.storageFactory.getItems();
  }

  historyAllocationString(allocation: Allocation): string {
    const vehicle = this.vehicleService.getVehicles().find(el => el?.id === allocation?.vehicleId)
    const employee = this.employeeService.getEmployees().find(el => el?.id === allocation?.employeeId)
    const date = DateTime.fromMillis(allocation?.startDate).toFormat('dd-MM-yyyy') + ' - ' + DateTime.fromMillis(allocation?.endDate).toFormat('dd-MM-yyyy')
    return (employee?.firstName || '')+ ' ' + (employee?.lastName || '') + ' | ' + vehicle?.plateNumber + ' | ' + date
  }

  resourceExists(data: Vehicle): boolean {
    const existingIndex = this.getAllocations().findIndex(
      (item) => item?.id === data?.id
    );

    if (existingIndex !== -1) {
      return true;
    } else {
      return false;
    }
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
