import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeService } from '../../services/tree.service';
import { AuthService } from '../../services/auth.service';
import { LandTreeSummaryResponseDto } from '../../api';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component( {
  selector: 'app-my-trees',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, TranslateModule],
  templateUrl: './my-trees.component.html',
  styleUrls: ['./my-trees.component.scss'],
} )
export class MyTreesComponent implements OnInit {
  loading = true;
  error: string | null = null;
  trees: LandTreeSummaryResponseDto[] = [];
  filteredTrees: LandTreeSummaryResponseDto[] = [];
  filterText = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 1;

  constructor (
    private treeService: TreeService,
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit (): void {
    const user = this.auth.getUser();
    if ( !user ) {
      this.error = 'No hay usuario en sesión.';
      this.loading = false;
      return;
    }

    const companyId = user.company?.id ?? undefined;
    const userId = companyId ? undefined : user.id ?? undefined;
    this.treeService.getTreesByOwner( userId, companyId ).subscribe( {
      next: ( resp ) => {
        this.trees = resp;
        this.applyFilter();
        this.loading = false;
      },
      error: ( err ) => {
        console.error( err );
        this.error = 'Error al cargar tus árboles.';
        this.loading = false;
      },
    } );
  }

  applyFilter (): void {
    const filter = this.filterText.toLowerCase();
    this.filteredTrees = this.trees.filter( ( t ) =>
      ( t.treeTypeName || '' ).toLowerCase().includes( filter )
    );
    this.currentPage = 0;
    this.totalPages = Math.ceil( this.filteredTrees.length / this.pageSize );
  }

  getPagedTrees (): LandTreeSummaryResponseDto[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredTrees.slice( start, start + this.pageSize );
  }

  previousPage (): void {
    if ( this.currentPage > 0 ) this.currentPage--;
  }

  nextPage (): void {
    if ( this.currentPage + 1 < this.totalPages ) this.currentPage++;
  }

  buyNewTree (): void {
    this.router.navigate( ['/buy-tree'] );
  }
}
