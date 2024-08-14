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

import { AppAuthButtonComponent } from './components/app-auth-button/app-auth-button.component';
import { LoginComponent } from "./pages/login/login.component";
import { PermissionService } from './services/permissions.service';
import { Observable, tap, catchError, of } from 'rxjs';

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
        MatProgressSpinnerModule
    ]
})
export class AppComponent  {
  constructor(
    private router: Router,
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService,
    private permissionService: PermissionService
  ) {}

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
  
}
