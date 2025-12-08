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
import { AdminTreeTypesComponent } from './dashboard/admin/tree-types/admin-tree-types/admin-tree-types.component';
import { TreeTypeComponent } from './dashboard/tree-type/tree-type.component';
import { AdminLandsComponent } from './dashboard/admin/lands/admin-lands/admin-lands.component';
import { LandComponent } from './dashboard/land/land.component';
import { MyTreesComponent } from './dashboard/my-trees/my-trees.component';
import { BuyTreeComponent } from './dashboard/my-trees/buy-tree/buy-tree.component';
import { TreeComponent } from './dashboard/my-trees/tree/tree.component';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: EmailVerifyComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Dashboard routes
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'my-trees', component: MyTreesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'buy-tree', component: BuyTreeComponent },
      {
        path: 'profile/:id',
        component: ProfileComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'profile/edit/:id',
        loadComponent: () =>
          import( './dashboard/profile/user-form/user-form.component' ).then( m => m.UserFormComponent ),
        canActivate: [AuthGuard]
      },
      { path: 'company', component: CompanyComponent },
      {
        path: 'company/:id',
        component: CompanyComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'tree-type/:id',
        component: TreeTypeComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'tree/:id',
        component: TreeComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'land/:id',
        loadComponent: () => import( './dashboard/land/land.component' ).then( m => m.LandComponent ),
        canActivate: [AuthGuard]
      },
      {
        path: 'land/edit-trees/:landId/:treeTypeId',
        loadComponent: () =>
          import( './dashboard/land/edit-trees/edit-trees.component' )
            .then( m => m.EditTreesComponent ),
        canActivate: [RoleGuard],
        data: { roles: [RolesEnum.ADMIN] }
      },

      // Nueva ruta de edición de compañía (igual que profile/edit)
      {
        path: 'company/form/:id',
        loadComponent: () =>
          import( './dashboard/company/company-form/company-form.component' )
            .then( m => m.CompanyFormComponent ),
        canActivate: [RoleGuard],
        data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
      },
      {
        path: 'tree/form/:id',
        loadComponent: () =>
          import( './dashboard/my-trees/tree/tree-form/tree-form.component' )
            .then( m => m.TreeFormComponent ),
      },

      { path: 'settings', component: SettingsComponent },

      // Admin section
      {
        path: 'admin',
        component: AdminPageComponent,
        canActivate: [AuthGuard],
        children: [
          // Users
          {
            path: 'users',
            component: AdminUsersComponent,
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },
          {
            path: 'user-form',
            loadComponent: () =>
              import( './dashboard/profile/user-form/user-form.component' ).then( m => m.UserFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },
          {
            path: 'user-form/:id',
            loadComponent: () =>
              import( './dashboard/profile/user-form/user-form.component' ).then( m => m.UserFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },

          // Companies
          {
            path: 'companies',
            component: AdminCompaniesComponent,
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN] }
          },
          {
            path: 'company-form',
            loadComponent: () =>
              import( './dashboard/company/company-form/company-form.component' )
                .then( m => m.CompanyFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },
          {
            path: 'company-form/:id',
            loadComponent: () =>
              import( './dashboard/company/company-form/company-form.component' )
                .then( m => m.CompanyFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },

          // Lands
          {
            path: 'lands',
            component: AdminLandsComponent,
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN] }
          },
          {
            path: 'land-form',
            loadComponent: () =>
              import( './dashboard/land/land-form/land-form.component' )
                .then( m => m.LandFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },
          {
            path: 'land-form/:id',
            loadComponent: () =>
              import( './dashboard/land/land-form/land-form.component' )
                .then( m => m.LandFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] }
          },

          // Tree Types
          {
            path: 'tree-types',
            component: AdminTreeTypesComponent,
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN] }
          },
          {
            path: 'tree-type-form',
            loadComponent: () =>
              import( './dashboard/admin/tree-types/tree-types-form/tree-types-form.component' )
                .then( m => m.TreeTypesFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN] }
          },
          {
            path: 'tree-type-form/:id',
            loadComponent: () =>
              import( './dashboard/admin/tree-types/tree-types-form/tree-types-form.component' )
                .then( m => m.TreeTypesFormComponent ),
            canActivate: [RoleGuard],
            data: { roles: [RolesEnum.ADMIN] }
          }
        ]
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];