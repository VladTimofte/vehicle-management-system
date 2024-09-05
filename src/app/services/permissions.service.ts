import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BehaviorSubject, Observable } from 'rxjs';

import { rolePermissions } from '../data/permissions';
import { APP_CONFIG } from "@src/app/config/config";

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private concatPermissions: string[] = [];
  private permissionsLoadedSubject = new BehaviorSubject<boolean>(false);
  permissionsLoaded$ = this.permissionsLoadedSubject.asObservable();

  constructor(private auth: AuthService) {
    this.auth.idTokenClaims$.subscribe(claims => {
      const roles: string[] =
        claims?.[APP_CONFIG.AUTH_SERVICE.ROLES_API] || [];

      roles.forEach(role => {
        if (rolePermissions[role as keyof typeof rolePermissions]) {
          rolePermissions[role as keyof typeof rolePermissions].forEach(perm => {
            if (!this.concatPermissions.includes(perm)) {
              this.concatPermissions.push(perm);
            }
          });
        }
      });
      this.permissionsLoadedSubject.next(true); // Notifică că permisiunile sunt încărcate
    });
  }

  hasAccess(permission: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.permissionsLoaded$.subscribe(isLoaded => {
        if (isLoaded) {
          observer.next(this.concatPermissions.includes(permission));
          observer.complete();
        }
      });
    });
  }
}
