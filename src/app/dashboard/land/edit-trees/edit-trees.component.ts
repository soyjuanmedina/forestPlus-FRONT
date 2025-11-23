import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TreeResponseDto } from '../../../api/model/treeResponse';
import { TreeService } from '../../../services/tree.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditTreeModalComponent } from '../../../shared/edit-tree-modal/edit-tree-modal.component';
import { Router } from '@angular/router';

@Component( {
  selector: 'app-edit-trees',
  standalone: true,
  templateUrl: './edit-trees.component.html',
  styleUrls: ['./edit-trees.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    TranslateModule
  ],
  encapsulation: ViewEncapsulation.None
} )
export class EditTreesComponent implements OnInit {
  trees: TreeResponseDto[] = [];
  filteredTrees: TreeResponseDto[] = [];

  filterText = '';
  currentPage = 0;
  pageSize = 10;
  totalPages = 1;

  constructor ( private treeService: TreeService, private dialog: MatDialog, private router: Router ) { }

  ngOnInit (): void {
    this.loadTrees();
  }

  loadTrees (): void {
    this.treeService.getAllTrees().subscribe( ( trees ) => {
      this.trees = trees;
      this.applyFilter();
    } );
  }

  applyFilter (): void {
    const filter = this.filterText.toLowerCase();
    this.filteredTrees = this.trees.filter(
      ( t ) =>
        ( t.treeTypeName || '' ).toLowerCase().includes( filter ) ||
        ( t.id + '' ).includes( filter )
    );
    this.currentPage = 0;
    this.totalPages = Math.ceil( this.filteredTrees.length / this.pageSize );
  }

  getPagedTrees (): TreeResponseDto[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredTrees.slice( start, start + this.pageSize );
  }

  previousPage (): void {
    if ( this.currentPage > 0 ) this.currentPage--;
  }

  nextPage (): void {
    if ( this.currentPage + 1 < this.totalPages ) this.currentPage++;
  }

  openEditModal ( tree?: TreeResponseDto ): void {

    const dialogRef = this.dialog.open( EditTreeModalComponent, {
      width: '400px',
      data: { tree: tree || null },
    }
    );

    dialogRef.afterClosed().subscribe( ( changed ) => {
      if ( changed ) {
        this.loadTrees(); // refrescar la lista
      }
    } );
  }

  deleteTree ( tree: TreeResponseDto ): void {
    if ( !tree.id ) {
      console.error( 'El árbol no tiene ID, no se puede eliminar' );
      return;
    }
    this.treeService.deleteTree( tree.id ).subscribe( () => this.loadTrees() );
  }

  goToUser ( userId: number ): void {
    this.router.navigate( [`/profile/`, userId] );
  }

  goToCompany ( companyId: number ): void {
    this.router.navigate( ['/company/', companyId] );
  }
}
