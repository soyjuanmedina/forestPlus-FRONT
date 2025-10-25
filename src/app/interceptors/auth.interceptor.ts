import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable( { providedIn: 'root' } )
export class AuthInterceptorFactory {
  constructor ( private authService: AuthService ) { }

  interceptor (): HttpInterceptorFn {
    return ( req: HttpRequest<any>, next: HttpHandlerFn ) => {
      const token = localStorage.getItem( 'forestPlus_token' );

      const authReq = token
        ? req.clone( { setHeaders: { Authorization: `Bearer ${token}` } } )
        : req;

      return next( authReq ).pipe(
        catchError( err => {
          if ( err.status === 401 || err.status === 403 ) {
            const refreshToken = localStorage.getItem( 'forestPlus_refresh_token' );

            if ( refreshToken ) {
              return from( this.authService.refreshToken() ).pipe(
                switchMap( resp => {
                  // Guardamos nuevos tokens
                  localStorage.setItem( 'forestPlus_token', ( resp as any ).token );
                  localStorage.setItem( 'forestPlus_refresh_token', ( resp as any ).refreshToken );

                  // Reintentamos la petición original
                  const retryReq = req.clone( {
                    setHeaders: { Authorization: `Bearer ${( resp as any ).token}` }
                  } );
                  return next( retryReq );
                } ),
                catchError( refreshErr => {
                  // Si falla refresh, cerramos sesión
                  this.authService.logout();
                  // 🔴 IMPORTANTE: devolver un error para cortar el flujo
                  return throwError( () => refreshErr );
                } )
              );
            } else {
              // No hay refresh token -> logout
              this.authService.logout();
              // 🔴 IMPORTANTE: devolver un error para cerrar el observable
              return throwError( () => err );
            }
          }

          // Otros errores
          return throwError( () => err );
        } )
      );
    };
  }
}
