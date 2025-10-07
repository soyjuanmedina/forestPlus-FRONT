import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable( {
  providedIn: 'root'
} )
export class RoleGuard implements CanActivate {

  constructor ( private userService: UserService, private router: Router ) { }

  canActivate ( route: ActivatedRouteSnapshot ): boolean {
    const rolesAllowed: string[] = route.data['roles'];
    const currentUser = this.userService.getCurrentUser();

    if ( !currentUser ) {
      this.router.navigate( ['/login'] );
      return false;
    }

    if ( currentUser.role && rolesAllowed.includes( currentUser.role ) ) { // asume que tu UserResponseDto tiene 'role'
      return true;
    } else {
      this.router.navigate( ['/dashboard'] ); // o cualquier página "no autorizado"
      return false;
    }
  }
}
