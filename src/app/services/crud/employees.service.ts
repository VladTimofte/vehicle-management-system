import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';

import { IStorageService } from '@src/app/models/common';
import { Employee } from '../../models/employee.model';
import { StorageFactory } from '../storage/storage.factory';
import { AuthService } from '../auth.service';
import { HistoryService } from './history.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  public storageFactory: IStorageService<Employee>;
  public historyService = inject(HistoryService);
  public auth = inject(AuthService);

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
    this.historyService.addHistory({
      id: uuidv4(),
      user: this.auth.getUserProfile()?.name as string,
      action: "ADD",
      entity: 'EMPLOYEE',
      resource: employee?.firstName + ' ' + employee?.lastName + ' | ' + employee?.cnp,
      date: DateTime.now().toMillis(),
    });
  }

  removeEmployee(id: string) {
    const employee = this.getEmployees().find((el) => el?.id === id);
    if (employee) {
      this.historyService.addHistory({
        id: uuidv4(),
        user: this.auth.getUserProfile()?.name as string,
        action: "DELETE",
        entity: 'EMPLOYEE',
        resource: employee?.firstName + ' ' + employee?.lastName + ' | ' + employee?.cnp,
        date: DateTime.now().toMillis(),
      });
    }
    this.storageFactory.removeItem(id);
  }

  getEmployees(): Employee[] {
    return this.storageFactory.getItems();
  }
}
