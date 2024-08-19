import { Component, Inject, OnInit } from '@angular/core';
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
import {MatBadgeModule} from '@angular/material/badge';

import { AppAuthButtonComponent } from './components/app-auth-button/app-auth-button.component';
import { LoginComponent } from "./pages/login/login.component";
import { PermissionService } from './services/permissions.service';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { Notification } from './models/notifications';
import { NotificationsService } from './services/notifications.service';
import { Subscription } from 'rxjs';
import { VehiclesService } from './services/crud/vehicles.service';
import { EmployeesService } from './services/crud/employees.service';

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
        NotificationsComponent
    ]
})
export class AppComponent implements OnInit {
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
    public employeesService: EmployeesService
  ) {
    this.notifications = this.notificationService.getNotifications();
  }

  ngOnInit(): void {
    // Subscribe to vehicles observable
    this.vehiclesSubscription = this.vehicleService
      .getVehiclesObservable()
      .subscribe((vehicles) => {
        this.notificationService.emptyNotifications()
        this.notificationService.initializeVehiclesNotifications(vehicles)
        this.notificationService.initializeEmployeesNotifications(this.employeesService.getEmployees())
        this.notifications = this.notificationService.getNotifications();
      });
    // Subscribe to employees observable
    this.employeesSubscription = this.employeesService
      .getEmployeesObservable()
      .subscribe((employees) => {
        this.notificationService.emptyNotifications()
        this.notificationService.initializeEmployeesNotifications(employees)
        this.notificationService.initializeVehiclesNotifications(this.vehicleService.getVehicles())
        this.notifications = this.notificationService.getNotifications();
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

  hasAccess(permission: string): boolean {
   return this.permissionService.hasAccess(permission)
  }

  openNotifications() {
    this.areNotificationsOpen = !this.areNotificationsOpen
  }
  
}
