import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component( {
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
} )
export class HeaderComponent {
  @Input() selectedLang: string = 'es';       // idioma actual
  @Output() selectedLangChange = new EventEmitter<string>();

  @Output() toggleSidebar = new EventEmitter<void>(); // para abrir/cerrar sidebar mobile

  constructor ( private translate: TranslateService ) { }

  switchLanguage ( lang: string ) {
    this.selectedLang = lang;
    this.selectedLangChange.emit( lang );
    this.translate.use( lang ); // <--- Cambia el idioma de la app
  }

  onToggleSidebar () {
    this.toggleSidebar.emit();
  }
}
