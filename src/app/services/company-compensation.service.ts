import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CompanyCompensationControllerService } from '../api';
import { CompanyCompensationRequestDto, CompanyCompensationResponseDto } from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class CompanyCompensationService {

  private compensationsSubject = new BehaviorSubject<CompanyCompensationResponseDto[] | null>( null );

  constructor ( private compensationController: CompanyCompensationControllerService ) { }

  getCompensations (): Observable<CompanyCompensationResponseDto[] | null> {
    return this.compensationsSubject.asObservable();
  }

  saveCompensation ( dto: CompanyCompensationRequestDto, id?: number ): Observable<CompanyCompensationResponseDto> {

    console.log( 'id', id );
    if ( id ) {
      // Si existe id, actualizar
      return this.compensationController.update( id, dto );
    } else {
      // Si no existe, crear
      return this.compensationController.create1( dto );
    }
  }

  loadByCompany ( companyId: number ): void {
    this.compensationController.findByCompany1( companyId ).subscribe( {
      next: res => this.compensationsSubject.next( res ),
      error: err => console.error( 'Error cargando compensaciones', err )
    } );
  }

  updateLocal ( compensation: CompanyCompensationResponseDto ) {
    const list = this.compensationsSubject.value || [];
    const idx = list.findIndex( c => c.id === compensation.id );
    if ( idx >= 0 ) list[idx] = compensation;
    else list.push( compensation );
    this.compensationsSubject.next( [...list] );
  }
}
