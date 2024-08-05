import { Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.getStoredAuthState());
  isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(private auth0: Auth0Service) {
    this.auth0.isAuthenticated$.subscribe(isAuthenticated => {
      this.isAuthenticatedSubject.next(isAuthenticated);
      this.storeAuthState(isAuthenticated);
    });
  }

  private getStoredAuthState(): boolean {
    // Verifică dacă există starea în storage
    return JSON.parse(localStorage.getItem('isAuthenticated') || 'false');
  }

  private storeAuthState(isAuthenticated: boolean): void {
    // Salvează starea în storage
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  }

  loginWithRedirect() {
    this.auth0.loginWithRedirect();
    this.storeAuthState(true);
  }

  logout(options: { logoutParams: { returnTo: string } }) {
    this.auth0.logout(options);
    this.storeAuthState(false);
  }
}
