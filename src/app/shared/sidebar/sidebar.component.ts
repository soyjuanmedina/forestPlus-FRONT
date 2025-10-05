import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component( {
  selector: 'app-sidebar',
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
} )
export class SidebarComponent {
  @Input() sidebarOpen = false;                // estado desde el padre
  @Output() sidebarOpenChange = new EventEmitter<boolean>();

  constructor ( public authService: AuthService ) { }

  toggleSidebar () {
    this.sidebarOpen = !this.sidebarOpen;
    this.sidebarOpenChange.emit( this.sidebarOpen );
  }

  closeSidebar () {
    if ( this.sidebarOpen ) {
      this.sidebarOpen = false;
      this.sidebarOpenChange.emit( this.sidebarOpen );
    }
  }
}
