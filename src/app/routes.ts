import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { AllocationsComponent } from './pages/allocations/allocations.component';
import { HistoryComponent } from './pages/history/history.component';
import { RoleGuard } from './services/role-guard.service';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['manager', 'hr'] },
      },
      {
        path: 'vehicles',
        component: VehiclesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['manager'] },
      },
      {
        path: 'employees',
        component: EmployeesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['hr'] },
      },
      {
        path: 'allocations',
        component: AllocationsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['hr'] },
      },
      {
        path: 'history',
        component: HistoryComponent,
        canActivate: [RoleGuard],
        data: { roles: ['manager'] },
      },
    ]
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },
  {
    path: '**',
    redirectTo: 'access-denied'
  }
];
