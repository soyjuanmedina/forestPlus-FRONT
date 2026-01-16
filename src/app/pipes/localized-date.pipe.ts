import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Pipe( {
  name: 'localizedDate',
  standalone: true,
  pure: false // 👈 importante
} )
export class LocalizedDatePipe implements PipeTransform {

  constructor ( private translate: TranslateService ) { }

  transform (
    value: Date | string | null | undefined,
    format: string
  ): string | null {
    if ( !value ) return null;

    const lang = this.translate.currentLang || 'en';
    const datePipe = new DatePipe( lang );

    return datePipe.transform( value, format );
  }
}
