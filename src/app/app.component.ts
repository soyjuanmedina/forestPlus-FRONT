import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';

@Component( {
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
} )
export class AppComponent {
  constructor ( private translate: TranslateService ) {
    translate.addLangs( ['en', 'es'] );
    translate.setDefaultLang( 'es' );
    const browserLang = translate.getBrowserLang();
    translate.use( browserLang?.match( /en|es/ ) ? browserLang : 'es' );
  }
}

