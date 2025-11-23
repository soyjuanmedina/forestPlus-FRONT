import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TreeResponseDto, TreeUpdateRequestDto, TreeTypeResponseDto } from '../../api';
import { TreeTypeService } from '../../services/tree-type.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component( {
  selector: 'app-edit-tree-modal',
  standalone: true,
  templateUrl: './edit-tree-modal.component.html',
  styleUrls: ['./edit-tree-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ]
} )
export class EditTreeModalComponent {

  form!: FormGroup;
  treeTypes: TreeTypeResponseDto[] = [];

  constructor (
    @Inject( MAT_DIALOG_DATA ) public data: { tree: TreeResponseDto },
    private dialogRef: MatDialogRef<EditTreeModalComponent>,
    private fb: FormBuilder,
    private treeTypeService: TreeTypeService
  ) {
    this.form = this.fb.group( {
      treeTypeId: [data.tree.treeTypeId, Validators.required],
      species: [data.tree.species],
      plantedAt: [data.tree.plantedAt, Validators.required],
      co2Absorption: [{ value: data.tree.co2Absorption, disabled: true }]
    } );

    this.loadTreeTypes();
  }

  loadTreeTypes (): void {
    this.treeTypeService.getAllTreeTypes().subscribe( types => {
      this.treeTypes = types;
      this.onTreeTypeChange(); // actualizar CO2 al cargar
    } );
  }

  onTreeTypeChange (): void {
    const selectedTypeId = this.form.get( 'treeTypeId' )?.value;
    const selectedType = this.treeTypes.find( t => t.id === selectedTypeId );
    if ( selectedType ) {
      this.form.get( 'co2Absorption' )?.setValue( selectedType.co2Absorption );
    }
  }

  save (): void {
    if ( this.form.invalid ) return;

    const update: TreeUpdateRequestDto = {
      ...this.form.getRawValue() // incluye el CO2
    };

    this.dialogRef.close( update );
  }

  close (): void {
    this.dialogRef.close();
  }
}
