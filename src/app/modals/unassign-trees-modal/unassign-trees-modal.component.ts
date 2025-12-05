import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TreeResponseDto } from '../../api/model/treeResponse';
import { TreeService } from '../../services/tree.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component( {
  selector: 'app-unassign-trees-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './unassign-trees-modal.component.html',
} )
export class UnassignTreesModalComponent implements OnInit {

  treeTypeName: string = '';
  trees: TreeResponseDto[] = []; // lista de árboles del tipo elegido
  target: 'company' | 'user' = 'company'; // indica de dónde desasignar
  companyId!: number;
  treeTypeId!: number;

  constructor (
    @Inject( MAT_DIALOG_DATA ) public data: any,
    private dialogRef: MatDialogRef<UnassignTreesModalComponent>,
    private treeService: TreeService,
    public loadingService: LoadingService
  ) {
    this.treeTypeName = data.treeTypeName || '';
    this.target = data.target || 'company';
    this.companyId = data.companyId;
    this.treeTypeId = data.treeTypeId;
  }

  ngOnInit (): void {
    if ( this.companyId && this.treeTypeId !== undefined ) {
      this.loadingService.show();  // <--- mostrar spinner
      this.treeService.getTreesByOwnerAndType( this.treeTypeId, undefined, this.companyId )
        .subscribe( {
          next: trees => this.trees = trees,
          error: err => console.error( 'Error cargando árboles del tipo', err ),
          complete: () => this.loadingService.hide()  // <--- ocultar spinner al terminar
        } );
    }
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

  close () {
    this.dialogRef.close( { updated: true } );
  }
}
