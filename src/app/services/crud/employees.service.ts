import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IStorageService } from '@src/app/models/common';
import { Employee } from '../../models/employee.model';
import { StorageFactory } from '../storage/storage.factory';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  public storageFactory: IStorageService<Employee>;

  constructor() {
    // Call createStorage with the type argument Employee
    this.storageFactory = StorageFactory.createStorage<Employee>();
    this.storageFactory.setKey('employees')
  }

  // Link existing functions to the new common service
  getEmployeesObservable(): Observable<Employee[]> {
    return this.storageFactory.getItemsObservable();
  }

  addOrUpdateEmployee(employee: Employee) {
    this.storageFactory.addOrUpdateItem(employee);
  }

  removeEmployee(id: string) {
    this.storageFactory.removeItem(id);
  }

  getEmployees(): Employee[] {
    return this.storageFactory.getItems();
  }
}
