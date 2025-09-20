import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component( {
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
} )
export class DashboardComponent {
  sidebarOpen = false;
  selectedLang = 'es';

  constructor ( private translate: TranslateService ) {
    // Idioma por defecto
    translate.setDefaultLang( 'es' );
    // Idioma inicial
    translate.use( 'es' );
  }

  toggleSidebar () {
    this.sidebarOpen = !this.sidebarOpen;
  }

  switchLanguage ( lang: string ) {
    this.selectedLang = lang;
    this.translate.use( lang );
  }
}
