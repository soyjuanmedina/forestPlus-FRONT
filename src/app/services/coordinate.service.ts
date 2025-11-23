import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CoordinateControllerService,
  CoordinateResponseDto,
  CoordinateRequestDto,
  CoordinateUpdateRequestDto
} from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class CoordinateService {

  constructor ( private coordinateApi: CoordinateControllerService ) { }

  getAllCoordinates (): Observable<CoordinateResponseDto[]> {
    return this.coordinateApi.getAllCoordinates();
  }

  getCoordinateById ( id: number ): Observable<CoordinateResponseDto> {
    return this.coordinateApi.getCoordinateById( id );
  }

  createCoordinate ( data: CoordinateRequestDto ): Observable<CoordinateResponseDto> {
    return this.coordinateApi.createCoordinate( data );
  }

  updateCoordinate ( id: number, data: CoordinateUpdateRequestDto ): Observable<CoordinateResponseDto> {
    return this.coordinateApi.updateCoordinate( id, data );
  }

  deleteCoordinate ( id: number ): Observable<void> {
    return this.coordinateApi.deleteCoordinate( id );
  }

  getCoordinatesByLand ( landId: number ): Observable<CoordinateResponseDto[]> {
    return this.coordinateApi.getCoordinatesByLand( landId );
  }

  deleteCoordinatesByLand ( landId: number ): Observable<void> {
    return this.coordinateApi.deleteCoordinatesByLand( landId );
  }
}
