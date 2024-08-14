import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { AllocationsComponent } from './pages/allocations/allocations.component';
import { HistoryComponent } from './pages/history/history.component';
import { RoleGuard } from './services/role-guard.service';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';

export const routes: Routes = [
  {
    path:'',
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'manager', 'hr'] },
      },
      {
        path: 'vehicles',
        component: VehiclesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'manager'] },
      },
      {
        path: 'employees',
        component: EmployeesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'hr'] },
      },
      {
        path: 'allocations',
        component: AllocationsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'hr'] },
      },
      {
        path: 'history',
        component: HistoryComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'manager'] },
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
