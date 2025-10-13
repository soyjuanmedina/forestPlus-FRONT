import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyControllerService } from '../api';
import { CompanyResponseDto } from '../api/model/companyResponse';

@Injectable( {
  providedIn: 'root'
} )
export class CompanyService {

  constructor ( private companyController: CompanyControllerService ) { }

  /** Obtener todas las compañías */
  getAllCompanies (): Observable<CompanyResponseDto[]> {
    return this.companyController.getAllCompanies();
  }

  /** Obtener compañía por ID */
  getCompanyById ( id: number ): Observable<CompanyResponseDto> {
    return this.companyController.getCompanyById( id );
  }

  /** Crear nueva compañía */
  createCompany ( company: { name: string } ): Observable<CompanyResponseDto> {
    return this.companyController.createCompany( { name: company.name } );
  }

  /** Actualizar compañía */
  updateCompany (
    id: number,
    company: { name: string; address?: string }
  ): Observable<CompanyResponseDto> {
    return this.companyController.updateCompany( id, {
      name: company.name,
      address: company.address
    } );
  }

  /** Eliminar compañía */
  deleteCompany ( id: number ): Observable<any> {
    return this.companyController.deleteCompany( id );
  }
}
