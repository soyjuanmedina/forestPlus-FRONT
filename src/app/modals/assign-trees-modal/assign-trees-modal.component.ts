import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LandService } from '../../services/land.service';
import { TreeService } from '../../services/tree.service';
import { LandResponseDto } from '../../api/model/landResponse';
import { TreeResponseDto } from '../../api/model/treeResponse';
import { PlannedPlantationResponseDto, TreeTypeResponseDto } from '../../api';
import { PlannedPlantationService } from '../../services/planned-plantation.service';
import { TreeTypeService } from '../../services/tree-type.service';

@Component( {
  selector: 'app-assign-trees-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './assign-trees-modal.component.html',
} )
export class AssignTreesModalComponent implements OnInit {

  form: FormGroup;
  lands: LandResponseDto[] = [];
  plannedPlantations: PlannedPlantationResponseDto[] = [];
  treeTypes: TreeTypeResponseDto[] = [];

  constructor (
    private fb: FormBuilder,
    private landService: LandService,
    private treeTypeService: TreeTypeService,
    private plannedPlantationService: PlannedPlantationService,
    public dialogRef: MatDialogRef<AssignTreesModalComponent>,
    @Inject( MAT_DIALOG_DATA ) public data: { userId?: number, companyId?: number }
  ) {
    this.form = this.fb.group( {
      landId: [null, Validators.required],
      plannedPlantationId: [null, Validators.required],
      treeTypeId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min( 1 )]],
    } );
  }

  ngOnInit () {
    // Cargar todos los terrenos
    this.landService.getAllLands().subscribe( lands => this.lands = lands );
    // Cargar tipos de árbol
    this.treeTypeService.getAllTreeTypes().subscribe( types => this.treeTypes = types );
  }

  onLandChange ( event: Event ) {
    const landId = Number( ( event.target as HTMLSelectElement ).value );

    // Reset dependientes
    this.form.patchValue( {
      plannedPlantationId: null,
      quantity: null
    } );

    this.plannedPlantations = [];

    // Obtener plantaciones del terreno seleccionado
    this.plannedPlantationService.getByLand( landId )
      .subscribe( pp => this.plannedPlantations = pp );
  }

  submit () {
    if ( !this.form.valid ) return;

    // Extraemos todos los valores que necesitamos
    const { landId, plannedPlantationId, treeTypeId, quantity } = this.form.value;
    // Construimos el payload para el padre
    const payload = {
      ownerUserId: this.data.userId,
      ownerCompanyId: this.data.companyId,
      ...this.form.value
    };
    console.log( 'payload', payload );
    // Cerramos el modal devolviendo el payload
    this.dialogRef.close( payload );
  }
}
