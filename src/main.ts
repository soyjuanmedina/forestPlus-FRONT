import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { importProvidersFrom, inject } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from './app/i18n/translate.loader';
import { HttpClient } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app/app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { loadingInterceptor } from './app/interceptors/loading.interceptor';
import { AuthService } from './app/services/auth.service';
import { provideApi } from './app/api';
import { environment } from './environments/environment';
import { catchError, switchMap, throwError } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';

registerLocaleData( localeEs );
registerLocaleData( localeEn );

// Loader de traducciones
export function HttpLoaderFactory ( http: HttpClient ) {
  return new TranslateHttpLoader( http, 'assets/i18n/', '.json' );
}

// Interceptor de auth
export const authInterceptor: HttpInterceptorFn = ( req, next ) => {
  const authService = inject( AuthService );
  const token = localStorage.getItem( 'forestPlus_token' );
  const authReq = token ? req.clone( { setHeaders: { Authorization: `Bearer ${token}` } } ) : req;

  return next( authReq ).pipe(
    catchError( err => {
      if ( err.status === 401 || err.status === 403 ) {
        const refreshToken = localStorage.getItem( 'forestPlus_refresh_token' );
        if ( refreshToken ) {
          return authService.refreshToken().pipe(
            switchMap( resp => {
              if ( resp.token && resp.refreshToken ) {
                localStorage.setItem( 'forestPlus_token', resp.token );
                localStorage.setItem( 'forestPlus_refresh_token', resp.refreshToken );
              } else {
                authService.logout();
                return throwError( () => new Error( 'Refresh token inválido' ) );
              }
              const retryReq = req.clone( { setHeaders: { Authorization: `Bearer ${resp.token}` } } );
              return next( retryReq );
            } ),
            catchError( refreshErr => {
              authService.logout();
              return throwError( () => refreshErr );
            } )
          );
        } else {
          authService.logout();
          return throwError( () => err );
        }
      }
      return throwError( () => err );
    } )
  );
};

// Bootstrap de la app
bootstrapApplication( AppComponent, {
  providers: [
    provideApi( environment.apiBaseUrl ),
    provideRouter( routes, withHashLocation() ), // 🔑 con hash
    importProvidersFrom(
      BrowserAnimationsModule,
      TranslateModule.forRoot( {
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      } )
    ),
    provideHttpClient( withInterceptors( [loadingInterceptor, authInterceptor] ) )
  ]
} ).catch( err => console.error( err ) );
