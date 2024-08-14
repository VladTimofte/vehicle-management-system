import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { rolePermissions } from '../data/permissions';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
concatPermissions: string[] = []

  constructor(private auth: AuthService) {
    this.auth.idTokenClaims$.subscribe(claims => {
      const roles: string[] =
        claims?.['https://hevicle-management-sys-dev.com/roles'] || [];

        roles.forEach(role => {
            if (rolePermissions[role as keyof typeof rolePermissions]) {
                rolePermissions[role as keyof typeof rolePermissions].forEach(perm => {
                // Verifică dacă permisiunea nu este deja în array
                if (!this.concatPermissions.includes(perm)) {
                    this.concatPermissions.push(perm);
                }
              });
            }
          });
    });
  }

  hasAccess(permission: string): boolean {
    return this.concatPermissions?.includes(permission)
  }
}
