import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeResponseDto } from '../../../api';
import { TreeService } from '../../../services/tree.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component( {
  selector: 'app-tree',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatCardModule, RouterModule],
  templateUrl: './tree.component.html'
} )
export class TreeComponent implements OnInit {

  tree?: TreeResponseDto;
  loading = true;

  constructor (
    private route: ActivatedRoute,
    private treeService: TreeService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit (): void {
    this.loadTree();
  }

  loadTree (): void {
    const id = Number( this.route.snapshot.paramMap.get( 'id' ) );

    if ( !id ) return;

    this.treeService.getTreeById( id ).subscribe( {
      next: ( res ) => {
        this.tree = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        console.error( 'Error loading tree' );
      }
    } );
  }

  getOwner (): string {
    if ( this.tree?.ownerCompanyName ) return this.tree.ownerCompanyName;
    if ( this.tree?.ownerUserName ) return this.tree.ownerUserName;
    return 'Sin propietario';
  }

  goToEdit () {
    if ( this.tree?.id ) {
      this.router.navigate( ['/tree/form', this.tree.id] );
    }
  }

  /** 🔹 Indica si el usuario puede ver el botón de edición */
  get canEdit (): boolean {
    const role = this.authService.currentUserRole;
    return role !== 'COMPANY_USER'; // Solo mostrar si no es COMPANY_USER
  }
}
