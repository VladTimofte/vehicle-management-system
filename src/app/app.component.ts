import { Component, Inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { DOCUMENT } from '@angular/common';

import { AppAuthButtonComponent } from './components/app-auth-button/app-auth-button.component';
import { LoginComponent } from "./pages/login/login.component";

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
        LoginComponent
    ]
})
export class AppComponent {
  title = 'FMS';

  constructor(
    private router: Router,
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService
  ) {}

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  conditionalDisplayActionBar(): boolean {
    const url = this.router.url;
    return !url.includes('track');
  }
}
