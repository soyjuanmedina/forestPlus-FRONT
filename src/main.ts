// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from './app/i18n/translate.loader';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // <--- importante
import { loadingInterceptor } from './app/interceptors/loading.interceptor';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { provideApi } from './app/api';
import { environment } from './environments/environment';


export function HttpLoaderFactory ( http: HttpClient ) {
  return new TranslateHttpLoader( http, '/assets/i18n/', '.json' );
}

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
