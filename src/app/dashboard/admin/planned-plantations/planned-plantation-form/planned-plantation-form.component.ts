import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PlannedPlantationService } from '../../../../services/planned-plantation.service';
import { PlannedPlantationRequestDto } from '../../../../api/model/plannedPlantationRequest';
import { PlannedPlantationResponseDto } from '../../../../api/model/plannedPlantationResponse';
import { LandService } from '../../../../services/land.service';
import { LandResponseDto } from '../../../../api/model/landResponse';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component( {
  selector: 'app-planned-plantation-form',
  standalone: true,
  templateUrl: './planned-plantation-form.component.html',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    TranslateModule,
    MatSlideToggleModule
  ]
} )
export class PlannedPlantationFormComponent implements OnInit {

  lands: LandResponseDto[] = [];
  loading = false;

  plantationId?: number;
  isEditMode = false;

  form: PlannedPlantationRequestDto = {
    landId: undefined,
    plannedDate: '',
    minTrees: 0,
    optimalTrees: undefined,
    maxTrees: undefined
  };

  constructor (
    private plannedPlantationService: PlannedPlantationService,
    private landService: LandService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) { }

  ngOnInit (): void {
    this.loadLands();

    const id = this.route.snapshot.paramMap.get( 'id' );
    if ( id ) {
      this.plantationId = +id;
      this.isEditMode = true;
      this.loadPlannedPlantation( this.plantationId );
    }
  }

  loadLands (): void {
    this.landService.getAllLands().subscribe( {
      next: lands => this.lands = lands,
      error: err => console.error( 'Error loading lands', err )
    } );
  }

  loadPlannedPlantation ( id: number ): void {
    this.plannedPlantationService.getById( id ).subscribe( {
      next: ( pp: PlannedPlantationResponseDto ) => {
        this.form = {
          landId: pp.landId,
          plannedDate: pp.plannedDate ?? '',
          minTrees: pp.minTrees ?? 0,
          optimalTrees: pp.optimalTrees,
          maxTrees: pp.maxTrees,
          isActive: pp.isActive
        };
      },
      error: err => {
        console.error( 'Error loading planned plantation', err );
        this.snackBar.open(
          this.translate.instant( 'PLANNED_PLANTATION.LOAD_ERROR' ),
          this.translate.instant( 'COMMON.CLOSE' ),
          { duration: 3000 }
        );
      }
    } );
  }

  onSubmit (): void {
    this.loading = true;

    const request$ = this.isEditMode && this.plantationId
      ? this.plannedPlantationService.update( this.plantationId, this.form )
      : this.plannedPlantationService.create( this.form );

    request$.subscribe( {
      next: () => {
        this.snackBar.open(
          this.translate.instant(
            this.isEditMode
              ? 'PLANNED_PLANTATION.UPDATED'
              : 'PLANNED_PLANTATION.CREATED'
          ),
          this.translate.instant( 'COMMON.CLOSE' ),
          { duration: 3000 }
        );
        this.router.navigate( ['/admin/planned-plantations'] );
      },
      error: err => {
        console.error( err );
        this.loading = false;
        this.snackBar.open(
          this.translate.instant( 'PLANNED_PLANTATION.ERROR' ),
          this.translate.instant( 'COMMON.CLOSE' ),
          { duration: 3000 }
        );
      }
    } );
  }

  onCancel (): void {
    this.router.navigate( ['/admin/planned-plantations'] );
  }
}
