// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, inject } from '@angular/core';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from './app/i18n/translate.loader';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // <--- importante
import { loadingInterceptor } from './app/interceptors/loading.interceptor';
import { AuthService } from './app/services/auth.service';
import { provideApi } from './app/api';
import { environment } from './environments/environment';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';


export function HttpLoaderFactory ( http: HttpClient ) {
  return new TranslateHttpLoader( http, '/assets/i18n/', '.json' );
}

// Interceptor de auth usando AuthService
export const authInterceptor: HttpInterceptorFn = ( req, next ) => {
  const authService = inject( AuthService );
  const token = localStorage.getItem( 'forestPlus_token' );

  const authReq = token ? req.clone( { setHeaders: { Authorization: `Bearer ${token}` } } ) : req;

  return next( authReq ).pipe(
    catchError( err => {
      if ( err.status === 401 ) {
        // refrescar token si hay refresh token
        return authService.refreshToken().pipe(
          switchMap( resp => {
            const retryReq = req.clone( {
              setHeaders: { Authorization: `Bearer ${resp.token}` }
            } );
            return next( retryReq ); // reintentar la petición original
          } )
        );
      }
      return throwError( () => err );
    } )
  );
};

bootstrapApplication( AppComponent, {
  providers: [
    provideApi( environment.apiBaseUrl ),
    provideHttpClient(),
    provideRouter( routes ),
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
