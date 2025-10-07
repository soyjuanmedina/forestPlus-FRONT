import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuLink {
  label: string;
  route: string;
  roles?: string[]; // Si está definido, solo lo ven estos roles
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
    { label: 'MENU.SETTINGS', route: 'settings' },
    { label: 'MENU.ADMIN', route: 'admin', roles: ['ADMIN', 'COMPANY_ADMIN'] }
  ];

  constructor ( public userService: UserService ) { }

  closeSidebar () {
    this.sidebarOpen = false;
    this.sidebarOpenChange.emit( this.sidebarOpen );
  }

  /** Devuelve true si el enlace es visible para el usuario actual */
  canShow ( link: MenuLink ): boolean {
    if ( !link.roles ) return true; // todos pueden ver
    const user = this.userService.getCurrentUser();
    console.log( 'user.role', user );
    return !!user && link.roles.includes( user.role! );
  }
}
