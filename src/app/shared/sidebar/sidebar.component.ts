import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RolesEnum } from '../../models/roles';

interface MenuLink {
  label: string;
  route?: string;
  roles?: RolesEnum[];
  children?: MenuLink[];
}

@Component( {
  selector: 'app-sidebar',
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
} )
export class SidebarComponent {
  @Input() sidebarOpen = false;
  @Output() sidebarOpenChange = new EventEmitter<boolean>();

  menuLinks: MenuLink[] = [
    { label: 'MENU.HOME', route: 'home' },
    { label: 'MENU.PROFILE', route: 'profile' },
    /* { label: 'MENU.MY_COMPANY', route: 'company', roles: [RolesEnum.COMPANY_ADMIN, RolesEnum.COMPANY_USER] },
       { label: 'MENU.MY_LANDS', route: 'lands' },
       { label: 'MENU.MY_TREES', route: 'trees' }, */
    {
      label: 'MENU.ADMIN.ADMIN',
      roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN],
      children: [
        { label: 'MENU.ADMIN.USERS', route: 'admin/users', roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] },
        /* { label: 'MENU.ADMIN.COMPANIES', route: 'admin/companies', roles: [RolesEnum.ADMIN] },
           { label: 'MENU.ADMIN.TREE_TYPES', route: 'admin/tree-types', roles: [RolesEnum.ADMIN] },
           { label: 'MENU.ADMIN.TREES', route: 'admin/trees', roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] },
           { label: 'MENU.ADMIN.AVAILABLE_LANDS', route: 'admin/available-lands', roles: [RolesEnum.ADMIN] },
           { label: 'MENU.ADMIN.LANDS', route: 'admin/lands', roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN] } */
      ]
    }
  ];

  constructor ( public userService: UserService ) { }

  closeSidebar () {
    this.sidebarOpen = false;
    this.sidebarOpenChange.emit( this.sidebarOpen );
  }

  canShow ( link: MenuLink ): boolean {
    if ( !link.roles ) return true;
    const user = this.userService.getCurrentUser();
    return !!user && link.roles.includes( user.role as RolesEnum );
  }

  get userLinks (): MenuLink[] {
    return this.menuLinks.filter( link => !link.children );
  }

  get adminLinks (): MenuLink[] {
    return this.menuLinks.filter( link => link.children && this.canShow( link ) );
  }
}
