import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component( {
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule, MatIconModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
} )
export class HeaderComponent {
  @Input() selectedLang: string = 'es';       // idioma actual
  @Output() selectedLangChange = new EventEmitter<string>();

  @Output() toggleSidebar = new EventEmitter<void>(); // para abrir/cerrar sidebar mobile

  currentUser$ = this.authService.user$;

  constructor ( private translate: TranslateService, private authService: AuthService, private router: Router ) { }

  switchLanguage ( lang: string ) {
    this.selectedLang = lang;
    this.selectedLangChange.emit( lang );
    this.translate.use( lang ); // <--- Cambia el idioma de la app
  }

  onToggleSidebar () {
    this.toggleSidebar.emit();
  }

  logout () {
    this.authService.logout();
    this.router.navigate( ['/login'] ); // redirige al login
  }

  goToProfile () {
    this.router.navigate( ['/profile'] ); // redirige al login
  }
}
