import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DB } from '../storage/db';
import { Vehicle } from '../models/vehicle.model';
import { vehicles } from '../mock/vehicles.mock';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService extends DB<Vehicle> {
  constructor() {
    super('vehicles', vehicles);
  }

  // Link existing functions to the new common service
  getFleetsObservable(): Observable<Vehicle[]> {
    return this.getItemsObservable();
  }

  addOrUpdateFleet(vehicle: Vehicle) {
    this.addOrUpdateItem(vehicle);
  }

  removeFleet(id: string) {
    this.removeItem(id);
  }

  getFleets() {
    return this.getItems();
  }
}
