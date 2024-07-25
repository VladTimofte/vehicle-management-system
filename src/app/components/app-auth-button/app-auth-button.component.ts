import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
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

}
