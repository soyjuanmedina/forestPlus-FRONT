import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable( {
  providedIn: 'root'
} )
export class AuthGuard implements CanActivate {

  constructor ( private authService: AuthService, private router: Router ) { }

  canActivate (): boolean {
    const user = this.authService.getUser(); // devuelve UserResponseDto | null

    console.log( 'user', user );
    if ( user ) return true;

    this.router.navigate( ['/login'] );
    return false;
  }
}
