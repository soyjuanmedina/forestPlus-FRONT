import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component( {
  selector: 'app-sidebar',
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
} )
export class SidebarComponent {
  @Input() sidebarOpen = false;          // Estado del sidebar (mobile)
  @Output() sidebarOpenChange = new EventEmitter<boolean>();

  toggleSidebar () {
    this.sidebarOpen = !this.sidebarOpen;
    this.sidebarOpenChange.emit( this.sidebarOpen );
  }
}
