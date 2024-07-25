import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DB } from '../storage/db';
import { Employee } from '../models/employee.model';
import { employees } from '../mock/employees.mock';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService extends DB<Employee> {
  constructor() {
    super('employees', employees);
  }

  // Link existing functions to the new common service
  getEmployeesObservable(): Observable<Employee[]> {
    return this.getItemsObservable();
  }

  addOrUpdateEmployee(employee: Employee) {
    this.addOrUpdateItem(employee);
  }

  removeEmployee(id: string) {
    this.removeItem(id);
  }

  getEmployees() {
    return this.getItems();
  }
}
