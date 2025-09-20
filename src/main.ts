// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from './app/i18n/translate.loader';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

export function HttpLoaderFactory ( http: HttpClient ) {
  return new TranslateHttpLoader( http, '/assets/i18n/', '.json' );
}

bootstrapApplication( AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter( routes ),
    importProvidersFrom(
      TranslateModule.forRoot( {
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      } )
    )
  ]
} ).catch( err => console.error( err ) );
