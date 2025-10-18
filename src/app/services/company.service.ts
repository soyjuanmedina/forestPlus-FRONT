import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CompanyControllerService, CompanyUpdateRequestDto } from '../api';
import { CompanyResponseDto } from '../api/model/companyResponse';

@Injectable( {
  providedIn: 'root'
} )
export class CompanyService {
  private companySubject = new BehaviorSubject<CompanyResponseDto | null>( null );

  constructor (
    private companyController: CompanyControllerService,
    private http: HttpClient
  ) {
    const savedCompany = localStorage.getItem( 'forestPlus_company' );
    if ( savedCompany ) {
      this.companySubject.next( JSON.parse( savedCompany ) );
    }
  }

  /** 🔹 Observable para suscribirse a cambios de la compañía */
  getCompany (): Observable<CompanyResponseDto | null> {
    return this.companySubject.asObservable();
  }

  /** 🔹 Valor actual de la compañía */
  getCurrentCompany (): CompanyResponseDto | null {
    return this.companySubject.value;
  }

  /** 🔹 Actualiza compañía local y en localStorage */
  updateCurrentCompany ( company: CompanyResponseDto ) {
    this.companySubject.next( company );
    localStorage.setItem( 'forestPlus_company', JSON.stringify( company ) );
  }

  /** 🔹 Limpia compañía */
  clearCompany () {
    this.companySubject.next( null );
    localStorage.removeItem( 'forestPlus_company' );
  }

  /** 🔹 Obtener todas las compañías */
  getAllCompanies (): Observable<CompanyResponseDto[]> {
    return this.companyController.getAllCompanies();
  }

  /** 🔹 Obtener todas las compañías con soporte para paginación si lo implementas */
  getCompanies ( page?: number, size?: number, sort?: string ): Observable<CompanyResponseDto[]> {
    // Si en el backend no tienes paginación para compañías, puedes usar getAllCompanies directamente
    return this.companyController.getAllCompanies();
  }

  /** 🔹 Obtener compañía por ID */
  getCompanyById ( id: number ): Observable<CompanyResponseDto> {
    return this.companyController.getCompanyById( id ).pipe(
      map( company => {
        this.updateCurrentCompany( company );
        return company;
      } )
    );
  }

  /** 🔹 Crear nueva compañía */
  createCompany ( company: { name: string; address?: string } ): Observable<CompanyResponseDto> {
    return this.companyController.createCompany( company ).pipe(
      map( created => {
        this.updateCurrentCompany( created );
        return created;
      } )
    );
  }

  /** 🔹 Actualizar compañía */
  updateCompany ( id: number, company: { name: string; address?: string; adminId?: number } ): Observable<CompanyResponseDto> {
    // Convertimos tu objeto simple al DTO generado
    const updateDto: CompanyUpdateRequestDto = {
      name: company.name,
      address: company.address
    };

    return this.companyController.updateCompany( id, updateDto ).pipe(
      map( updated => {
        if ( this.companySubject.value?.id === updated.id ) {
          this.updateCurrentCompany( updated );
        }
        return updated;
      } )
    );
  }

  /** 🔹 Eliminar compañía */
  deleteCompany ( id: number ): Observable<any> {
    return this.companyController.deleteCompany( id ).pipe(
      map( res => {
        if ( this.companySubject.value?.id === id ) {
          this.clearCompany();
        }
        return res;
      } )
    );
  }

  updateCompanyPicture ( id: number, file: File ): Observable<CompanyResponseDto> {
    const formData = new FormData();
    formData.append( 'file', file );

    return this.http.put<CompanyResponseDto>(
      `${environment.apiBaseUrl}/api/companies/${id}/picture`,
      formData
    ).pipe(
      map( company => {
        if ( this.companySubject.value?.id === company.id ) {
          this.updateCurrentCompany( company );
        }
        return company;
      } )
    );
  }
}
