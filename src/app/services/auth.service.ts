import { Injectable } from '@angular/core';
import { AuthService as Auth0Service, User } from '@auth0/auth0-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated$!: Observable<boolean>;
  private userProfileSubject = new BehaviorSubject<User | null>(null);

  constructor(private auth0: Auth0Service){
    this.isAuthenticated$ = this.auth0.isAuthenticated$;

    this.auth0.user$.pipe(
      filter((profile): profile is User | null => profile !== undefined), // Filter out undefined values
      tap(profile => {
        this.userProfileSubject.next(profile);
      })
    ).subscribe();
  }

  loginWithRedirect() {
    this.auth0.loginWithRedirect();
  }

  logout(options: { logoutParams: { returnTo: string } }) {
    this.auth0.logout(options);
  }

  getUserProfile(): User | null {
    return this.userProfileSubject.getValue();
  }
}
