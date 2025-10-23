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
import { RolesEnum } from './models/roles';
import { AdminPageComponent } from './dashboard/admin/admin-page/admin-page.component';
import { AdminUsersComponent } from './dashboard/admin/users/admin-users/admin-users.component';
import { AdminCompaniesComponent } from './dashboard/admin/companies/admin-companies/admin-companies.component';
import { CompanyComponent } from './dashboard/company/company.component';

export const routes: Routes = [
  // 🔓 Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: EmailVerifyComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // 🔐 Protected (dashboard)
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'settings', component: SettingsComponent },

      // 👤 USER profile + edit
      { path: 'profile', component: ProfileComponent },
      {
        path: 'profile/edit/:id',
        loadComponent: () =>
          import( './dashboard/profile/user-form/user-form.component' )
            .then( m => m.UserFormComponent ),
        canActivate: [AuthGuard]
      },

      // 🏢 COMPANY profile + edit
      { path: 'company', component: CompanyComponent },
      {
        path: 'company/edit/:id',
        loadComponent: () =>
          import( './dashboard/company/company-form/company-form.component' )
            .then( m => m.CompanyFormComponent ),
        canActivate: [RoleGuard],
        data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
      },

      // 🛠️ ADMIN section
      {
        path: 'admin',
        component: AdminPageComponent,
        canActivate: [AuthGuard],
        children: [
          // 👥 Users (list + form)
          {
            path: 'users',
            component: AdminUsersComponent,
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },
          {
            path: 'user-form/:id',
            loadComponent: () =>
              import( './dashboard/profile/user-form/user-form.component' )
                .then( m => m.UserFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },

          // 🏢 Companies (list + form)
          {
            path: 'companies',
            component: AdminCompaniesComponent,
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN] }
          },
          {
            path: 'company-form/:id',
            loadComponent: () =>
              import( './dashboard/company/company-form/company-form.component' )
                .then( m => m.CompanyFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          }
        ]
      }
    ]
  },

  // 🚧 Fallback
  { path: '**', redirectTo: 'login' }
];
