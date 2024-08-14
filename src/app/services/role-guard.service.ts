import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    // Verifică dacă utilizatorul este autentificat
    return this.auth.isAuthenticated$.pipe(
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          // Dacă nu este autentificat, redirecționează către pagina de autentificare
          this.auth.loginWithRedirect();
          // Returnează `false` imediat ce redirectul este făcut
          return of(false);
        } else {
          // Dacă utilizatorul este autentificat, verifică rolurile
          return this.auth.idTokenClaims$.pipe(
            map(claims => {
              const roles = claims?.['https://hevicle-management-sys-dev.com/roles'] || [];
              const allowedRoles = route.data['roles'] as Array<string>;

              if (allowedRoles.some(role => roles.includes(role))) {
                return true;
              } else {
                this.router.navigate(['/access-denied']);
                return false;
              }
            })
          );
        }
      })
    );
  }
}
