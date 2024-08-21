import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';

import { AppAuthButtonComponent } from './components/app-auth-button/app-auth-button.component';
import { LoginComponent } from './pages/login/login.component';
import { PermissionService } from './services/permissions.service';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { Notification } from './models/notifications';
import { NotificationsService } from './services/notifications.service';
import { Subscription } from 'rxjs';
import { VehiclesService } from './services/crud/vehicles.service';
import { EmployeesService } from './services/crud/employees.service';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { AllocationsComponent } from './pages/allocations/allocations.component';
import { HistoryComponent } from './pages/history/history.component';
import { SaveToExcelService } from './services/save-to-excell.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    RouterOutlet,
    AppAuthButtonComponent,
    LoginComponent,
    MatProgressSpinnerModule,
    MatBadgeModule,
    NotificationsComponent,
  ],
})
export class AppComponent implements OnInit {
  @ViewChild(VehiclesComponent) vehiclesComponent!: VehiclesComponent;
  @ViewChild(EmployeesComponent) employeesComponent!: EmployeesComponent;
  @ViewChild(AllocationsComponent) allocationsComponent!: AllocationsComponent;
  @ViewChild(HistoryComponent) historyComponent!: HistoryComponent;

  public hasVehicleAccess$!: boolean;
  public hasEmployeesAccess$!: boolean;
  public hasAllocationsAccess$!: boolean;
  public hasHistoryAccess$!: boolean;
  areNotificationsOpen: boolean = false;
  notifications: Notification[] = [];

  private vehiclesSubscription: Subscription | undefined;
  private employeesSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService,
    private permissionService: PermissionService,
    public notificationService: NotificationsService,
    public vehicleService: VehiclesService,
    public employeesService: EmployeesService,
    private saveToExcellService: SaveToExcelService
  ) {
    this.notifications = this.notificationService.getNotifications();
  }

  ngOnInit(): void {
    // Subscribe to vehicles observable
    this.vehiclesSubscription = this.vehicleService
      .getVehiclesObservable()
      .subscribe((vehicles) => {
        this.notificationService.emptyNotifications();
        this.notificationService.initializeVehiclesNotifications(vehicles);
        this.notificationService.initializeEmployeesNotifications(
          this.employeesService.getEmployees()
        );
        this.notifications = this.notificationService.getNotifications();
      });
    // Subscribe to employees observable
    this.employeesSubscription = this.employeesService
      .getEmployeesObservable()
      .subscribe((employees) => {
        this.notificationService.emptyNotifications();
        this.notificationService.initializeEmployeesNotifications(employees);
        this.notificationService.initializeVehiclesNotifications(
          this.vehicleService.getVehicles()
        );
        this.notifications = this.notificationService.getNotifications();
      });
    this.permissionService.hasAccess('read:vehicles').subscribe((hasAccess) => {
      this.hasVehicleAccess$ = hasAccess;
    });
    this.permissionService
      .hasAccess('read:employees')
      .subscribe((hasAccess) => {
        this.hasEmployeesAccess$ = hasAccess;
      });
    this.permissionService
      .hasAccess('read:allocations')
      .subscribe((hasAccess) => {
        this.hasAllocationsAccess$ = hasAccess;
      });
    this.permissionService.hasAccess('read:history').subscribe((hasAccess) => {
      this.hasHistoryAccess$ = hasAccess;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from vehicles observable to avoid memory leaks
    if (this.vehiclesSubscription) {
      this.vehiclesSubscription.unsubscribe();
    }
    if (this.employeesSubscription) {
      this.employeesSubscription.unsubscribe();
    }
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  conditionalDisplayActionBar(): boolean {
    const url = this.router.url;
    return !url.includes('track');
  }

  isAccessDeniedRoute(): boolean {
    return this.router.url === '/access-denied';
  }

  openNotifications() {
    this.areNotificationsOpen = !this.areNotificationsOpen;
  }

  exportToExcell() {
    this.saveToExcellService.exportToExcel(this.router.url);
  }
}
