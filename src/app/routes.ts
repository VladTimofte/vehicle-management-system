import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { AllocationsComponent } from './pages/allocations/allocations.component';
import { HistoryComponent } from './pages/history/history.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'vehicles', component: VehiclesComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'allocations', component: AllocationsComponent },
  { path: 'history', component: HistoryComponent },
];
