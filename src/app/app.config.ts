import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { provideApi } from './api';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection( { eventCoalescing: true } ),
  provideRouter( routes ),
  provideAnimationsAsync(),
  provideAnimationsAsync(),
  provideApi( environment.apiBaseUrl )
  ]
};
