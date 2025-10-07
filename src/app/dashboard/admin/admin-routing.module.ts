import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../guards/role.guard';
import { AdminPageComponent } from './admin-page/admin-page.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPageComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'COMPANY_ADMIN'] } // solo estos roles
  }
];

@NgModule( {
  imports: [RouterModule.forChild( routes )],
  exports: [RouterModule]
} )
export class AdminPageRoutingModule { }
