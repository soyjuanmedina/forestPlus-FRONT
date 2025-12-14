import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeResponseDto, TreeUpdateRequestDto, PlannedPlantationResponseDto } from '../../../../api';
import { TreeService } from '../../../../services/tree.service';
import { PlannedPlantationService } from '../../../../services/planned-plantation.service';
import { AuthService } from '../../../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component( {
  selector: 'app-tree-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './tree-form.component.html',
  styleUrls: ['./tree-form.component.scss']
} )
export class TreeFormComponent implements OnInit {

  treeForm!: FormGroup;
  tree!: TreeResponseDto;
  isAdmin = false;

  plannedPlantations: PlannedPlantationResponseDto[] = [];

  constructor (
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private treeService: TreeService,
    private plannedPlantationService: PlannedPlantationService,
    private authService: AuthService
  ) { }

  ngOnInit (): void {
    this.isAdmin = this.authService.currentUserRole === 'ADMIN';

    const id = this.route.snapshot.paramMap.get( 'id' );
    if ( id ) {
      this.treeService.getTreeById( +id ).subscribe( tree => {
        this.tree = tree;

        // Cargar plantaciones disponibles del terreno
        if ( tree.land?.id ) {
          this.loadPlannedPlantations( tree.land.id );
        }

        this.initForm();
      } );
    }
  }

  private loadPlannedPlantations ( landId: number ): void {
    this.plannedPlantationService.getByLand( landId ).subscribe( res => {
      this.plannedPlantations = res;
    } );
  }

  private initForm (): void {
    this.treeForm = this.fb.group( {
      customName: [this.tree.customName || ''],
      treeTypeName: [{ value: this.tree.treeType?.name, disabled: true }],
      scientificName: [{ value: this.tree.scientificName, disabled: true }],
      co2AbsorptionAt20: [{ value: this.tree.co2AbsorptionAt20, disabled: !this.isAdmin }, [Validators.required, Validators.min( 0 )]],
      co2AbsorptionAt25: [{ value: this.tree.co2AbsorptionAt25, disabled: !this.isAdmin }, [Validators.min( 0 )]],
      co2AbsorptionAt30: [{ value: this.tree.co2AbsorptionAt30, disabled: !this.isAdmin }, [Validators.min( 0 )]],
      co2AbsorptionAt35: [{ value: this.tree.co2AbsorptionAt35, disabled: !this.isAdmin }, [Validators.min( 0 )]],
      co2AbsorptionAt40: [{ value: this.tree.co2AbsorptionAt40, disabled: !this.isAdmin }, [Validators.min( 0 )]],
      plantedAt: [{ value: this.tree.plantedAt, disabled: !this.isAdmin }, Validators.required],
      landName: [{ value: this.tree.land?.name, disabled: true }],
      ownerName: [{ value: this.tree.ownerUserName, disabled: true }],
      plannedPlantationId: [this.tree.plannedPlantation?.id || null]
    } );
  }

  save (): void {
    if ( !this.treeForm.valid ) return;

    const updateDto: TreeUpdateRequestDto = {
      customName: this.treeForm.get( 'customName' )?.value,
      co2AbsorptionAt20: this.treeForm.get( 'co2AbsorptionAt20' )?.value,
      co2AbsorptionAt25: this.treeForm.get( 'co2AbsorptionAt25' )?.value,
      co2AbsorptionAt30: this.treeForm.get( 'co2AbsorptionAt30' )?.value,
      co2AbsorptionAt35: this.treeForm.get( 'co2AbsorptionAt35' )?.value,
      co2AbsorptionAt40: this.treeForm.get( 'co2AbsorptionAt40' )?.value,
      plantedAt: this.treeForm.get( 'plantedAt' )?.value,
      plannedPlantationId: this.treeForm.get( 'plannedPlantationId' )?.value
    };

    this.treeService.updateTree( this.tree.id!, updateDto ).subscribe( () => {
      this.router.navigate( ['/tree', this.tree.id] );
    } );
  }

  cancel (): void {
    this.router.navigate( ['/tree', this.tree.id] );
  }

}
