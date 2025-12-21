import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RolesEnum } from '../../models/roles';
import { MatIconModule } from '@angular/material/icon';

interface MenuLink {
  label: string;
  icon: string;
  route?: string;
  roles?: RolesEnum[];
  children?: MenuLink[];
}

@Component( {
  selector: 'app-sidebar',
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
} )
export class SidebarComponent {
  @Input() sidebarOpen = false;
  @Output() sidebarOpenChange = new EventEmitter<boolean>();

  menuLinks: MenuLink[] = [
    { label: 'MENU.HOME', route: 'home', icon: 'fa-solid fa-house' },
    { label: 'MENU.PROFILE', route: 'profile', icon: 'fa-solid fa-user' },
    { label: 'MENU.MY_COMPANY', route: 'company', roles: [RolesEnum.COMPANY_ADMIN, RolesEnum.COMPANY_USER], icon: 'fa-solid fa-building' },
    { label: 'MENU.MY_TREES', route: 'my-trees', roles: [RolesEnum.USER], icon: 'fa-solid fa-tree' },
    { label: 'MENU.ADMIN.LANDS', route: '/land/1', roles: [RolesEnum.USER], icon: 'fa-solid fa-tree-city' },
    { label: 'MENU.MY_COMPANY_TREES', route: 'my-trees', roles: [RolesEnum.COMPANY_ADMIN, RolesEnum.COMPANY_USER], icon: 'fa-solid fa-seedling' },
    {
      label: 'MENU.ADMIN.ADMIN',
      roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN],
      icon: 'fa-solid fa-gear',
      children: [
        { label: 'MENU.ADMIN.USERS', route: 'admin/users', roles: [RolesEnum.ADMIN, RolesEnum.COMPANY_ADMIN], icon: 'fa-solid fa-users' },
        { label: 'MENU.ADMIN.COMPANIES', route: 'admin/companies', roles: [RolesEnum.ADMIN], icon: 'fa-solid fa-building' },
        { label: 'MENU.ADMIN.LANDS', route: 'admin/lands', roles: [RolesEnum.ADMIN], icon: 'fa-solid fa-tree-city' },
        { label: 'MENU.ADMIN.TREE_TYPES', route: 'admin/tree-types', roles: [RolesEnum.ADMIN], icon: 'fa-solid fa-leaf' },
        { label: 'MENU.ADMIN.PLANNED_PLANTATIONS', route: 'admin/planned-plantations', roles: [RolesEnum.ADMIN], icon: 'fa-solid fa-seedling' },
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

  onToggleSidebar (): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.sidebarOpenChange.emit( this.sidebarOpen );
  }
}
