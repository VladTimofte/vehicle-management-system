import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { AllocationsComponent } from './pages/allocations/allocations.component';
import { HistoryComponent } from './pages/history/history.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [authGuardFn] },
  { path: 'vehicles', component: VehiclesComponent, canActivate: [authGuardFn] },
  { path: 'employees', component: EmployeesComponent, canActivate: [authGuardFn] },
  { path: 'allocations', component: AllocationsComponent, canActivate: [authGuardFn] },
  { path: 'history', component: HistoryComponent, canActivate: [authGuardFn] },
];
