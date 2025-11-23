import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LandControllerService, LandRequestDto, LandResponseDto, LandUpdateRequestDto } from '../api';
import { CoordinateControllerService } from '../api';
import { TreeControllerService } from '../api';
import { CoordinateResponseDto } from '../api/model/coordinateResponse';
import { TreeResponseDto } from '../api/model/treeResponse';

@Injectable( {
  providedIn: 'root'
} )
export class LandService {
  private landSubject = new BehaviorSubject<LandResponseDto | null>( null );

  constructor (
    private landController: LandControllerService,
    private coordinateController: CoordinateControllerService,
    private treeController: TreeControllerService
  ) {
    const savedLand = localStorage.getItem( 'forestPlus_land' );
    if ( savedLand ) this.landSubject.next( JSON.parse( savedLand ) );
  }

  getLand (): Observable<LandResponseDto | null> {
    return this.landSubject.asObservable();
  }

  getCurrentLand (): LandResponseDto | null {
    return this.landSubject.value;
  }

  updateCurrentLand ( land: LandResponseDto ) {
    this.landSubject.next( land );
    localStorage.setItem( 'forestPlus_land', JSON.stringify( land ) );
  }

  clearLand () {
    this.landSubject.next( null );
    localStorage.removeItem( 'forestPlus_land' );
  }

  /** Lands */
  getAllLands (): Observable<LandResponseDto[]> {
    return this.landController.getAllLands();
  }

  getLandById ( id: number ): Observable<LandResponseDto> {
    return this.landController.getLandById( id );
  }

  createLand ( land: LandRequestDto ): Observable<LandResponseDto> {
    return this.landController.createLand( land );
  }

  updateLand ( id: number, land: LandUpdateRequestDto ): Observable<LandResponseDto> {
    return this.landController.updateLand( id, land );
  }

  deleteLand ( id: number ): Observable<any> {
    return this.landController.deleteLand( id );
  }

  /** Coordenadas */
  getCoordinatesByLand ( landId: number ): Observable<CoordinateResponseDto[]> {
    return this.coordinateController.getCoordinatesByLand( landId );
  }

  createCoordinate ( landId: number, coord: any ): Observable<CoordinateResponseDto> {
    return this.coordinateController.createCoordinate( { ...coord, landId } );
  }

  deleteCoordinate ( id: number ): Observable<any> {
    return this.coordinateController.deleteCoordinate( id );
  }

  /** Árboles */
  getTreesByLand ( landId: number ): Observable<TreeResponseDto[]> {
    return this.treeController.getTreesByLand( landId );
  }
}
