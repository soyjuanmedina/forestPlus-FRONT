import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { PlannedPlantationResponseDto } from '../../../../api/model/plannedPlantationResponse';
import { UserService } from '../../../../services/user.service';
import { RolesEnum } from '../../../../models/roles';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlannedPlantationService } from '../../../../services/planned-plantation.service';

@Component( {
  selector: 'app-admin-planned-plantations',
  standalone: true,
  templateUrl: './admin-planned-plantations.component.html',
  styleUrls: ['./admin-planned-plantations.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    TranslateModule
  ]
} )
export class AdminPlannedPlantationsComponent implements OnInit {

  plannedPlantations: PlannedPlantationResponseDto[] = [];
  filteredPlannedPlantations: PlannedPlantationResponseDto[] = [];

  currentPage = 0;
  pageSize = 5;
  totalPages = 1;

  filterText = '';

  constructor (
    private plannedPlantationService: PlannedPlantationService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit (): void {
    this.loadPlannedPlantations();
  }

  loadPlannedPlantations (): void {
    this.plannedPlantationService.getAll().subscribe( {
      next: ( data: PlannedPlantationResponseDto[] ) => {
        this.plannedPlantations = data;
        this.applyFilter();
      },
      error: ( err ) => console.error( '❌ Error al cargar plantaciones', err )
    } );
  }

  applyFilter (): void {
    const filter = this.filterText.trim().toLowerCase();
    this.filteredPlannedPlantations = this.plannedPlantations.filter( pp =>
      ( pp.landName || '' ).toLowerCase().includes( filter ) ||
      ( pp.plannedDate || '' ).toLowerCase().includes( filter ) ||
      ( pp.effectiveDate || '' ).toLowerCase().includes( filter )
    );

    this.currentPage = 0;
    this.totalPages = Math.ceil( this.filteredPlannedPlantations.length / this.pageSize );
  }

  getPagedPlannedPlantations (): PlannedPlantationResponseDto[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredPlannedPlantations.slice( start, start + this.pageSize );
  }

  previousPage (): void {
    if ( this.currentPage > 0 ) this.currentPage--;
  }

  nextPage (): void {
    if ( this.currentPage + 1 < this.totalPages ) this.currentPage++;
  }

  addPlannedPlantation (): void {
    this.router.navigate( ['/admin/planned-plantation-form'] );
  }

  onEdit ( pp: PlannedPlantationResponseDto ): void {
    this.router.navigate( ['/admin/planned-plantation-form', pp.id] );
  }

  onView ( pp: PlannedPlantationResponseDto ): void {
    this.router.navigate( ['/planned-plantation', pp.id] );
  }

  onDelete ( pp: PlannedPlantationResponseDto ): void {
    if ( !pp.id ) return;

    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant( 'COMMON.CONFIRM_DELETE' ),
        message: this.translate.instant( 'COMMON.CONFIRM_DELETE_MESSAGE', { name: pp.landName || '' } )
      }
    } );

    dialogRef.afterClosed().subscribe( result => {
      if ( result && pp.id !== undefined ) {
        this.plannedPlantationService.delete( pp.id ).subscribe( {
          next: () => {
            this.snackBar.open(
              this.translate.instant( 'ADMIN_PLANNED_PLANTATION.DELETED' ),
              this.translate.instant( 'COMMON.CLOSE' ),
              { duration: 3000 }
            );
            this.loadPlannedPlantations();
          },
          error: ( err ) => {
            console.error( 'Error al eliminar plantación', err );
            this.snackBar.open(
              this.translate.instant( 'ADMIN_PLANNED_PLANTATION.DELETE_ERROR' ),
              this.translate.instant( 'COMMON.CLOSE' ),
              { duration: 3000 }
            );
          }
        } );
      }
    } );
  }
}
