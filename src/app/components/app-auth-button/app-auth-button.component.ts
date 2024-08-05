import { Component, Inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  templateUrl: './app-auth-button.component.html',
  styleUrls: ['./app-auth-button.component.scss'],
  imports: [CommonModule]
})
export class AppAuthButtonComponent {
  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService) {}

  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.document.location.origin } });
  }
}
