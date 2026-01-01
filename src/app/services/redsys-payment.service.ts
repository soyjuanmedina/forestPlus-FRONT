import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RedsysPaymentResponseDto } from '../api/model/redsysPaymentResponse';
import { RedsysNotificationRequestDto } from '../api/model/redsysNotificationRequest';
import { RedsysPaymentsControllerService } from '../api/api/redsysPaymentsController.service';

@Injectable( { providedIn: 'root' } )
export class RedsysPaymentService {

  constructor ( private redsysApi: RedsysPaymentsControllerService ) { }

  /**
   * Solicita al backend los datos de pago para un pedido
   * @param orderId ID del pedido
   * @returns Observable con los parámetros de Redsys
   */
  createPayment ( orderId: number ): Observable<RedsysPaymentResponseDto> {
    return this.redsysApi.createPayment( orderId );
  }

  /**
   * Envía la notificación de Redsys al backend
   * @param notification Objeto con los datos de notificación de Redsys
   * @returns Observable con la respuesta del backend
   */
  handleNotification ( notification: RedsysNotificationRequestDto ): Observable<string> {
    return this.redsysApi.handleNotification( notification );
  }

  /**
   * Redirige al usuario a Redsys con los parámetros recibidos del backend
   * @param paymentData Parámetros de Redsys obtenidos del backend
   */
  sendToRedsys ( paymentData: RedsysPaymentResponseDto ): void {

    if ( !paymentData.redsysUrl ) {
      throw new Error( 'URL de Redsys no disponible' );
    }

    const parameters = paymentData.parameters ?? {};

    const form = document.createElement( 'form' );
    form.method = 'POST';
    form.action = paymentData.redsysUrl;

    Object.entries( parameters ).forEach( ( [key, value] ) => {
      const input = document.createElement( 'input' );
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild( input );
    } );

    document.body.appendChild( form );
    form.submit();
    document.body.removeChild( form ); // limpieza opcional del DOM
  }
}
