import { Injectable } from '@angular/core';
import { CompanyCo2YearlyControllerService } from '../api/api/companyCo2YearlyController.service';
import { CompanyCO2YearlyRequestDto } from '../api/model/companyCO2YearlyRequest';
import { CompanyCO2YearlyResponseDto } from '../api/model/companyCO2YearlyResponse';
import { Observable } from 'rxjs';

@Injectable( {
  providedIn: 'root'
} )
export class CompanyCo2Service {

  constructor ( private co2Api: CompanyCo2YearlyControllerService ) { }

  /**
   * Obtener todos los registros CO2 de una empresa
   */
  getAll ( companyId: number ): Observable<CompanyCO2YearlyResponseDto[]> {
    return this.co2Api.getCompanyCO2YearlyList( companyId );
  }

  /**
   * Crear o actualizar un registro anual de CO2
   */
  save ( companyId: number, data: CompanyCO2YearlyRequestDto ): Observable<CompanyCO2YearlyResponseDto> {
    return this.co2Api.createOrUpdateCompanyCO2Yearly( companyId, data );
  }

  /**
   * Eliminar un registro de CO2
   */
  delete ( companyId: number, id: number ): Observable<any> {
    return this.co2Api.deleteCompanyCO2Yearly( companyId, id );
  }
}
