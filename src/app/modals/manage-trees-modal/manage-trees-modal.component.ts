import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TreeResponseDto } from '../../api/model/treeResponse';
import { TreeService } from '../../services/tree.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { MatIconModule } from '@angular/material/icon';

@Component( {
  selector: 'app-manage-trees-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './manage-trees-modal.component.html',
} )
export class ManageTreesModalComponent implements OnInit {

  treeTypeName: string = '';
  trees: TreeResponseDto[] = []; // lista de árboles del tipo elegido
  target: 'company' | 'user' = 'company'; // indica de dónde desasignar
  companyId!: number;
  treeTypeId!: number;

  constructor (
    @Inject( MAT_DIALOG_DATA ) public data: any,
    private dialogRef: MatDialogRef<ManageTreesModalComponent>,
    private treeService: TreeService,
    public loadingService: LoadingService
  ) {
    this.treeTypeName = data.treeTypeName || '';
    this.target = data.target || 'company';
    this.companyId = data.companyId;
    this.treeTypeId = data.treeTypeId;
  }

  ngOnInit (): void {
    this.loadingService.show();

    // Si viene un usuario
    if ( this.data.userId && this.treeTypeId !== undefined ) {
      this.target = 'user';
      this.treeService.getTreesByOwnerAndType(
        this.treeTypeId,
        this.data.userId,
        undefined
      )
        .subscribe( {
          next: trees => this.trees = trees,
          error: err => console.error( 'Error cargando árboles del usuario', err ),
          complete: () => this.loadingService.hide()
        } );
      return;
    }

    // Si viene una empresa
    if ( this.data.companyId && this.treeTypeId !== undefined ) {
      this.target = 'company';
      this.treeService.getTreesByOwnerAndType(
        this.treeTypeId,
        undefined,
        this.data.companyId
      )
        .subscribe( {
          next: trees => this.trees = trees,
          error: err => console.error( 'Error cargando árboles de la compañía', err ),
          complete: () => this.loadingService.hide()
        } );
      return;
    }

    // Si no hay nada válido
    this.loadingService.hide();
    console.error( "❌ No se proporcionó ni userId ni companyId al modal" );
  }


  unassignTree ( treeId: number ) {
    let unassign$;

    if ( this.target === 'company' ) {
      unassign$ = this.treeService.unassignTreeFromCompany( treeId );
    } else {
      unassign$ = this.treeService.unassignTreeFromUser( treeId );
    }

    unassign$.subscribe( {
      next: () => {
        // eliminar de la lista local
        this.trees = this.trees.filter( t => t.id !== treeId );
      },
      error: err => console.error( '❌ Error al desasignar árbol', err )
    } );

  }

  editTree ( treeId: number ) {
    console.log( 'treeId', treeId );
  }

  close () {
    this.dialogRef.close( { updated: true } );
  }
}
