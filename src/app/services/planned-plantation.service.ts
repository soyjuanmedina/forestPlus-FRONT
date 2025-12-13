import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  PlannedPlantationControllerService,
  PlannedPlantationRequestDto,
  PlannedPlantationResponseDto,
  PlannedPlantationUpdateRequestDto
} from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class PlannedPlantationService {

  private plantationSubject = new BehaviorSubject<PlannedPlantationResponseDto | null>( null );

  constructor ( private controller: PlannedPlantationControllerService ) {
    const saved = localStorage.getItem( 'forestPlus_plantation' );
    if ( saved ) this.plantationSubject.next( JSON.parse( saved ) );
  }

  /** Plantación actual en memoria */
  getPlantation (): Observable<PlannedPlantationResponseDto | null> {
    return this.plantationSubject.asObservable();
  }

  getCurrentPlantation (): PlannedPlantationResponseDto | null {
    return this.plantationSubject.value;
  }

  updateCurrentPlantation ( plantation: PlannedPlantationResponseDto ) {
    this.plantationSubject.next( plantation );
    localStorage.setItem( 'forestPlus_plantation', JSON.stringify( plantation ) );
  }

  clearPlantation () {
    this.plantationSubject.next( null );
    localStorage.removeItem( 'forestPlus_plantation' );
  }

  /** CRUD */
  getAll (): Observable<PlannedPlantationResponseDto[]> {
    return this.controller.getAll();
  }

  getById ( id: number ): Observable<PlannedPlantationResponseDto> {
    return this.controller.getById( id );
  }

  create ( dto: PlannedPlantationRequestDto ): Observable<PlannedPlantationResponseDto> {
    return this.controller.create( dto );
  }

  update ( id: number, dto: PlannedPlantationUpdateRequestDto ): Observable<PlannedPlantationResponseDto> {
    return this.controller.update( id, dto );
  }

  delete ( id: number ): Observable<any> {
    return this.controller._delete( id );
  }

  /** Endpoints específicos */
  getByLand ( landId: number ): Observable<PlannedPlantationResponseDto[]> {
    return this.controller.getByLand( landId );
  }

  getExecuted (): Observable<PlannedPlantationResponseDto[]> {
    return this.controller.getExecuted();
  }

  getPending (): Observable<PlannedPlantationResponseDto[]> {
    return this.controller.getPending();
  }

  getWithoutLand (): Observable<PlannedPlantationResponseDto[]> {
    return this.controller.getWithoutLand();
  }

  getBetweenDates ( start: string, end: string ): Observable<PlannedPlantationResponseDto[]> {
    return this.controller.getBetweenDates( start, end );
  }
}
