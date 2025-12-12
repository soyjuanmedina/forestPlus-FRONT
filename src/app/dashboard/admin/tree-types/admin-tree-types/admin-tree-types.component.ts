import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { TreeTypeResponseDto } from '../../../../api/model/treeTypeResponse';
import { UserService } from '../../../../services/user.service';
import { TreeTypeService } from '../../../../services/tree-type.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component( {
  selector: 'app-admin-tree-types',
  standalone: true,
  templateUrl: './admin-tree-types.component.html',
  styleUrls: ['./admin-tree-types.component.scss'],
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, FormsModule, TranslateModule]
} )
export class AdminTreeTypesComponent implements OnInit {
  treeTypes: TreeTypeResponseDto[] = [];
  filteredTreeTypes: TreeTypeResponseDto[] = [];

  currentPage = 0;
  pageSize = 5;
  totalPages = 1;

  filterText = '';

  constructor (
    private treeTypeService: TreeTypeService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit (): void {
    this.loadTreeTypes();
  }

  loadTreeTypes (): void {
    this.treeTypeService.getAllTreeTypes().subscribe( {
      next: ( data ) => {
        this.treeTypes = data;
        this.applyFilter();
      },
      error: ( err ) => console.error( '❌ Error al cargar tipos de árboles', err )
    } );
  }

  applyFilter (): void {
    const filter = this.filterText.trim().toLowerCase();
    this.filteredTreeTypes = this.treeTypes.filter( tt =>
      ( tt.name || '' ).toLowerCase().includes( filter ) ||
      ( tt.description || '' ).toLowerCase().includes( filter )
    );

    this.currentPage = 0;
    this.totalPages = Math.ceil( this.filteredTreeTypes.length / this.pageSize );
  }

  getPagedTreeTypes (): TreeTypeResponseDto[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredTreeTypes.slice( start, start + this.pageSize );
  }

  previousPage (): void {
    if ( this.currentPage > 0 ) this.currentPage--;
  }

  nextPage (): void {
    if ( this.currentPage + 1 < this.totalPages ) this.currentPage++;
  }

  addTreeType (): void {
    this.router.navigate( ['/admin/tree-type-form'] );
  }

  onEdit ( treeType: TreeTypeResponseDto ): void {
    this.router.navigate( ['/admin/tree-type-form', treeType.id] );
  }

  onView ( treeType: TreeTypeResponseDto ): void {
    this.router.navigate( ['/tree-type', treeType.id] );
  }

  onDelete ( treeType: TreeTypeResponseDto ): void {
    if ( !treeType.id ) return;

    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant( 'ADMIN_TREE_TYPES.CONFIRM_DELETE_TREE_TYPE.TITLE' ),
        message: this.translate.instant( 'ADMIN_TREE_TYPES.CONFIRM_DELETE_TREE_TYPE.MESSAGE', { name: treeType.name } )
      }
    } );

    dialogRef.afterClosed().subscribe( result => {
      if ( result && treeType.id !== undefined ) {
        this.treeTypeService.deleteTreeType( treeType.id ).subscribe( {
          next: () => {
            this.snackBar.open(
              this.translate.instant( 'ADMIN_TREE_TYPES.TREE_TYPE_DELETED' ),
              this.translate.instant( 'COMMON.CLOSE' ),
              { duration: 3000 }
            );
            this.loadTreeTypes();
          },
          error: ( err ) => {
            console.error( 'Error al eliminar tipo de árbol', err );
            const message = this.translate.instant( err?.error?.message );

            this.snackBar.open(
              message,
              this.translate.instant( 'COMMON.CLOSE' ),
              { duration: 3000 }
            );
          }
        } );
      }
    } );
  }
}
