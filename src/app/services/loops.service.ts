import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmailDtoDto, LoopsControllerService } from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class LoopsService {

  constructor ( private loopsApi: LoopsControllerService ) { }

  /**
   * Registra un email en la waitlist de Loops
   * @param email Dirección de email a registrar
   * @returns Observable<boolean> con true si tuvo éxito, false si no
   */
  registerEmail ( email: string ): Observable<boolean> {
    const dto: EmailDtoDto = { email };
    return this.loopsApi.registerEmail( dto );
  }
}
