import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { Notification } from '../models/notifications';
import { VehiclesService } from './crud/vehicles.service';
import { documentExpired, documentExpiresWithinMonth } from '../utils/booleans';
import { EmployeesService } from './crud/employees.service';
import { Vehicle } from '../models/vehicle.model';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications: Notification[] = [];

  constructor(
    public vehicleService: VehiclesService,
    public employeesService: EmployeesService
  ) {
    this.initializeVehiclesNotifications(this.vehicleService.getVehicles());
    this.initializeEmployeesNotifications(this.employeesService.getEmployees());
  }

  public emptyNotifications() {
    console.log('TEST', this.notifications);
    this.notifications = [];
  }

  public initializeVehiclesNotifications(vehicles: Vehicle[]) {
    this.computeVehicleNotifications(vehicles);
  }

  public initializeEmployeesNotifications(employees: Employee[]) {
    this.computeEmployeesNotifications(employees);
  }

  private computeVehicleNotifications(vehicles: Vehicle[]) {
    for (let i = 0; i < vehicles.length; i++) {
      if (documentExpired(vehicles[i].expirationDateITP)) {
        // Vehicle ITP expired
        this.pushNotification(
          'dangerous',
          `Vehicle's ${vehicles[i].plateNumber} ITP has expired!`
        );
      } else if (documentExpiresWithinMonth(vehicles[i].expirationDateITP)) {
        // Vehicle ITP expires in less than a month
        this.pushNotification(
          'error',
          `Vehicle's ${vehicles[i].plateNumber} ITP expires in less than a month `
        );
      }

      if (documentExpired(vehicles[i].expirationDateRCA)) {
        // Vehicle RCA expired
        this.pushNotification(
          'dangerous',
          `Vehicle's ${vehicles[i].plateNumber} RCA has expired!`
        );
      } else if (documentExpiresWithinMonth(vehicles[i].expirationDateRCA)) {
        // Vehicle RCA expires in less than a month
        this.pushNotification(
          'error',
          `Vehicle's ${vehicles[i].plateNumber} RCA expires in less than a month `
        );
      }
    }
  }

  private computeEmployeesNotifications(employees: Employee[]) {
    for (let i = 0; i < employees.length; i++) {
      if (documentExpired(employees[i].drivingLicenseExDate)) {
        // Employee Driving License expired
        this.pushNotification(
          'dangerous',
          `${employees[i].firstName} ${employees[i].lastName}'s Driving License has expired `
        );
      } else if (
        documentExpiresWithinMonth(employees[i].drivingLicenseExDate) // Employee Driving License expires in less than a month
      ) {
        this.pushNotification(
          'error',
          `${employees[i].firstName} ${employees[i].lastName}'s Driving License expires in less than a month `
        );
      }
    }
  }

  private pushNotification(icon: string, msg: string) {
    this.notifications.push({
      icon,
      notification: msg,
    });
  }

  getNotifications() {
    return this.notifications.sort((a, b) => { // Order
      if (a.icon === 'dangerous' && b.icon !== 'dangerous') {
        return -1; // a before b
      }
      if (a.icon !== 'dangerous' && b.icon === 'dangerous') {
        return 1; // b before a
      }
      return 0; // Keep actual order
    });
  }
}
