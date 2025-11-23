import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  TreeControllerService,
  TreeResponseDto,
  TreeRequestDto,
  TreeUpdateRequestDto,
  LandTreeSummaryResponseDto,
  TreeBatchPlantRequestDto
} from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class TreeService {

  constructor ( private treeApi: TreeControllerService ) { }

  // Obtener todos los árboles
  getAllTrees (): Observable<TreeResponseDto[]> {
    return this.treeApi.getAllTrees();
  }

  // Obtener árbol por id
  getTreeById ( id: number ): Observable<TreeResponseDto> {
    return this.treeApi.getTreeById( id );
  }

  // Crear árbol
  createTree ( data: TreeRequestDto ): Observable<TreeResponseDto> {
    return this.treeApi.createTree( data );
  }

  // Actualizar árbol
  updateTree ( id: number, data: TreeUpdateRequestDto ): Observable<TreeResponseDto> {
    return this.treeApi.updateTree( id, data );
  }

  // Eliminar árbol
  deleteTree ( id: number ): Observable<void> {
    return this.treeApi.deleteTree( id );
  }

  // Obtener árboles por terreno (resumen)
  getTreesByLand ( landId: number ): Observable<LandTreeSummaryResponseDto[]> {
    return this.treeApi.getTreesByLand( landId );
  }

  // Obtener árboles sin propietario por terreno (nuevo endpoint)
  getUnassignedTreesByLand ( landId: number ): Observable<TreeResponseDto[]> {
    return this.treeApi.getUnassignedTreesByLand( landId );
  }

  // Obtener árboles por propietario
  getTreesByOwner ( ownerUserId?: number, ownerCompanyId?: number ): Observable<LandTreeSummaryResponseDto[]> {
    return this.treeApi.getTreesByOwner( ownerUserId, ownerCompanyId );
  }

  // Asignar árbol a usuario (nuevo endpoint)
  assignTreeToUser ( treeId: number, userId: number ): Observable<TreeResponseDto> {
    return this.treeApi.assignTreeToUser( treeId, userId );
  }

  // Plantar lote de árboles
  plantTreeBatch ( data: TreeBatchPlantRequestDto ): Observable<object> {
    return this.treeApi.plantTreeBatch( data );
  }

  // Obtener árboles de un terreno filtrados por tipo
  getTreesByLandAndType ( landId: number, treeTypeId: number ): Observable<TreeResponseDto[]> {
    return this.treeApi.getTreesByLandAndType( landId, treeTypeId );
  }
}
