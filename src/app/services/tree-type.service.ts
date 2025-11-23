import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  TreeTypeControllerService,
  TreeTypeRequestDto
} from '../api';
import { TreeTypeResponseDto } from '../api/model/treeTypeResponse';

@Injectable( {
  providedIn: 'root'
} )
export class TreeTypeService {
  private treeTypeSubject = new BehaviorSubject<TreeTypeResponseDto | null>( null );

  constructor (
    private treeTypeController: TreeTypeControllerService,
    private http: HttpClient
  ) {
    const saved = localStorage.getItem( 'forestPlus_treeType' );
    if ( saved ) {
      this.treeTypeSubject.next( JSON.parse( saved ) );
    }
  }

  /** 🔹 Observable para suscribirse a cambios del TreeType */
  getTreeType (): Observable<TreeTypeResponseDto | null> {
    return this.treeTypeSubject.asObservable();
  }

  /** 🔹 Valor actual */
  getCurrentTreeType (): TreeTypeResponseDto | null {
    return this.treeTypeSubject.value;
  }

  /** 🔹 Actualiza TreeType local y en localStorage */
  updateCurrentTreeType ( treeType: TreeTypeResponseDto ) {
    this.treeTypeSubject.next( treeType );
    localStorage.setItem( 'forestPlus_treeType', JSON.stringify( treeType ) );
  }

  /** 🔹 Limpia TreeType */
  clearTreeType () {
    this.treeTypeSubject.next( null );
    localStorage.removeItem( 'forestPlus_treeType' );
  }

  /** 🔹 Obtener todos los tipos de árbol */
  getAllTreeTypes (): Observable<TreeTypeResponseDto[]> {
    return this.treeTypeController.getAllTreeTypes();
  }

  /** 🔹 Obtener tipo de árbol por ID */
  getTreeTypeById ( id: number ): Observable<TreeTypeResponseDto> {
    return this.treeTypeController.getTreeTypeById( id ).pipe(
      map( treeType => {
        this.updateCurrentTreeType( treeType );
        return treeType;
      } )
    );
  }

  /** 🔹 Crear nuevo tipo de árbol */
  createTreeType ( treeType: TreeTypeRequestDto ): Observable<TreeTypeResponseDto> {
    return this.treeTypeController.createTreeType( treeType ).pipe(
      map( created => {
        this.updateCurrentTreeType( created );
        return created;
      } )
    );
  }

  /** 🔹 Actualizar tipo de árbol */
  updateTreeType ( id: number, treeType: TreeTypeRequestDto ): Observable<TreeTypeResponseDto> {
    return this.treeTypeController.updateTreeType( id, treeType ).pipe(
      map( updated => {
        if ( this.treeTypeSubject.value?.id === updated.id ) {
          this.updateCurrentTreeType( updated );
        }
        return updated;
      } )
    );
  }

  /** 🔹 Eliminar tipo de árbol */
  deleteTreeType ( id: number ): Observable<void> {
    return this.treeTypeController.deleteTreeType( id ).pipe(
      map( res => {
        if ( this.treeTypeSubject.value?.id === id ) {
          this.clearTreeType();
        }
        return res;
      } )
    );
  }

  /** 🔹 Actualizar imagen del tipo de árbol */
  updateTreeTypePicture ( id: number, file: File ): Observable<TreeTypeResponseDto> {
    const formData = new FormData();
    formData.append( 'file', file );

    return this.http.put<TreeTypeResponseDto>(
      `${environment.apiBaseUrl}/api/tree-types/${id}/picture`,
      formData
    ).pipe(
      map( treeType => {
        if ( this.treeTypeSubject.value?.id === treeType.id ) {
          this.updateCurrentTreeType( treeType );
        }
        return treeType;
      } )
    );
  }
}
