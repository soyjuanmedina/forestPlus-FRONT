import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { environment } from '../environments/environment';
import { CommonModule } from '@angular/common';

@Component( {
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TranslateModule, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
} )
export class AppComponent {
  environment = environment;
  constructor ( private translate: TranslateService ) {
    translate.addLangs( ['en', 'es'] );
    translate.setDefaultLang( 'es' );
    const browserLang = translate.getBrowserLang();
    translate.use( browserLang?.match( /en|es/ ) ? browserLang : 'es' );
  }
}

