import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseControllerService, PurchaseRequestDto, PurchaseResponseDto } from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class PurchaseService {

  constructor ( private purchaseApi: PurchaseControllerService ) { }

  // Realizar compra de árboles
  purchaseTrees ( request: PurchaseRequestDto ): Observable<PurchaseResponseDto> {
    return this.purchaseApi.purchaseTrees( request );
  }
}
