import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { RolesEnum } from '../core/constants/roles';

@Injectable( {
  providedIn: 'root'
} )
export class RoleGuard implements CanActivate {

  constructor (
    private userService: UserService,
    private router: Router
  ) { }

  canActivate ( route: ActivatedRouteSnapshot ): boolean {
    const rolesAllowed: RolesEnum[] = route.data['roles']; // 👈 ahora el array es de tipo RolesEnum
    const currentUser = this.userService.getCurrentUser();

    if ( !currentUser ) {
      this.router.navigate( ['/login'] );
      return false;
    }

    if ( currentUser.role && rolesAllowed.includes( currentUser.role as RolesEnum ) ) {
      return true;
    } else {
      this.router.navigate( ['/dashboard'] );
      return false;
    }
  }
}
