import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './dashboard/home/home.component';
import { ProfileComponent } from './dashboard/profile/profile.component';
import { SettingsComponent } from './dashboard/settings/settings.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { EmailVerifyComponent } from './pages/email-verify/email-verify.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { RoleGuard } from './guards/role.guard';
import { AdminPageComponent } from './dashboard/admin/admin-page/admin-page.component';
import { AdminUsersComponent } from './dashboard/admin/users/admin-users/admin-users.component';
import { RolesEnum } from './models/roles';
import { CompanyComponent } from './dashboard/company/company.component';
import { AdminCompaniesComponent } from './dashboard/admin/companies/admin-companies/admin-companies.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: EmailVerifyComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'company', component: CompanyComponent },
      { path: 'settings', component: SettingsComponent },

      // 👇 Sección Admin protegida por roles
      {
        path: 'admin',
        component: AdminPageComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'users',
            component: AdminUsersComponent,
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },
          {
            path: 'user-form',
            loadComponent: () =>
              import( './dashboard/admin/users/admin-users/user-form/user-form.component' )
                .then( m => m.UserFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },
          {
            path: 'user-form/:id',
            loadComponent: () =>
              import( './dashboard/admin/users/admin-users/user-form/user-form.component' )
                .then( m => m.UserFormComponent ),
            canActivate: [AuthGuard]
          },
          {
            path: 'companies',
            component: AdminCompaniesComponent,
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN] }
          },
          {
            path: 'company-form',
            loadComponent: () =>
              import( './dashboard/admin/companies/admin-companies/company-form/company-form.component' )
                .then( m => m.CompanyFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },
          {
            path: 'company-form/:id',
            loadComponent: () =>
              import( './dashboard/admin/companies/admin-companies/company-form/company-form.component' )
                .then( m => m.CompanyFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
