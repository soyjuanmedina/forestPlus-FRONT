import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { LandResponseDto } from '../../../../api/model/landResponse';
import { LandService } from '../../../../services/land.service';
import { UserService } from '../../../../services/user.service';
import { RolesEnum } from '../../../../models/roles';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component( {
  selector: 'app-admin-lands',
  standalone: true,
  templateUrl: './admin-lands.component.html',
  styleUrls: ['./admin-lands.component.scss'],
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, FormsModule, TranslateModule]
} )
export class AdminLandsComponent implements OnInit {

  lands: LandResponseDto[] = [];
  filteredLands: LandResponseDto[] = [];

  currentPage = 0;
  pageSize = 5;
  totalPages = 1;

  filterText = '';

  constructor (
    private landService: LandService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit (): void {
    this.loadLands();
  }

  loadLands (): void {
    const currentUser = this.userService.getCurrentUser();
    const companyId = currentUser?.company?.id;

    this.landService.getAllLands().subscribe( {
      next: ( data: LandResponseDto[] ) => {
        if ( currentUser?.role === RolesEnum.COMPANY_ADMIN && companyId != null ) {
          this.lands = data.filter( l => ( l.companyIds || [] ).includes( companyId ) );
        } else {
          this.lands = data;
        }
        this.applyFilter();
      },
      error: ( err ) => console.error( '❌ Error al cargar terrenos', err )
    } );
  }

  applyFilter (): void {
    const filter = this.filterText.trim().toLowerCase();
    this.filteredLands = this.lands.filter( l =>
      ( l.name || '' ).toLowerCase().includes( filter ) ||
      ( l.location || '' ).toLowerCase().includes( filter )
    );

    this.currentPage = 0;
    this.totalPages = Math.ceil( this.filteredLands.length / this.pageSize );
  }

  getPagedLands (): LandResponseDto[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredLands.slice( start, start + this.pageSize );
  }

  previousPage (): void {
    if ( this.currentPage > 0 ) this.currentPage--;
  }

  nextPage (): void {
    if ( this.currentPage + 1 < this.totalPages ) this.currentPage++;
  }

  addLand (): void {
    this.router.navigate( ['/admin/land-form'] );
  }

  onEdit ( land: LandResponseDto ): void {
    this.router.navigate( ['/admin/land-form', land.id] );
  }

  onView ( land: LandResponseDto ): void {
    this.router.navigate( ['/land', land.id] );
  }

  onDelete ( land: LandResponseDto ): void {
    if ( !land.id ) return;

    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant( 'COMMON.CONFIRM_DELETE' ),
        message: this.translate.instant( 'COMMON.CONFIRM_DELETE_MESSAGE', { name: land.name } )
      }
    } );

    dialogRef.afterClosed().subscribe( result => {
      if ( result && land.id !== undefined ) {
        this.landService.deleteLand( land.id ).subscribe( {
          next: () => {
            this.snackBar.open(
              this.translate.instant( 'ADMIN_LANDS.LAND_DELETED' ),
              this.translate.instant( 'COMMON.CLOSE' ),
              { duration: 3000 }
            );
            this.loadLands();
          },
          error: ( err ) => {
            console.error( 'Error al eliminar terreno', err );
            this.snackBar.open(
              this.translate.instant( 'ADMIN_LANDS.LAND_DELETE_ERROR' ),
              this.translate.instant( 'COMMON.CLOSE' ),
              { duration: 3000 }
            );
          }
        } );
      }
    } );
  }
}
