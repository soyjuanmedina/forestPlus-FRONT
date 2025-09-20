import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // raíz redirige al dashboard
  { path: 'dashboard', component: DashboardComponent },
  // otras rutas futuras aquí
];
