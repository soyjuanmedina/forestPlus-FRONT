import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderRequestDto, OrderResponseDto, OrdersControllerService } from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class OrdersService {

  constructor ( private ordersApi: OrdersControllerService ) { }

  /**
   * Crea un pedido y devuelve los datos del pedido creado
   */
  createOrder ( request: OrderRequestDto ): Observable<OrderResponseDto> {
    return this.ordersApi.createOrder( request );
  }
}
