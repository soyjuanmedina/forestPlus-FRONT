import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component( {
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], // 👈 necesario para *ngIf, *ngFor, etc.
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
} )
export class DashboardComponent {
  sidebarOpen = false;

  toggleSidebar () {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
