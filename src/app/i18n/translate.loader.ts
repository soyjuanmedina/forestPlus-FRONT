import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class TranslateHttpLoader implements TranslateLoader {
  constructor ( private http: HttpClient, private prefix = 'assets/i18n/', private suffix = '.json' ) { }

  public getTranslation ( lang: string ): Observable<any> {
    return this.http.get( `${this.prefix}${lang}${this.suffix}` );
  }
}
