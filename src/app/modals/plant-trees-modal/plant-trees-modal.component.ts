import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TreeTypeResponseDto } from '../../api/model/treeTypeResponse';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';

@Component( {
  selector: 'app-plant-trees-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatCardModule
  ],
  templateUrl: './plant-trees-modal.component.html',
} )
export class PlantTreesModalComponent implements OnInit {

  treeTypes: TreeTypeResponseDto[] = [];
  form: FormGroup;

  constructor (
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PlantTreesModalComponent>,
    @Inject( MAT_DIALOG_DATA ) public data: { treeTypes: TreeTypeResponseDto[] }
  ) {
    this.form = this.fb.group( {
      treeTypeId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min( 1 )]]
    } );
  }

  ngOnInit () {
    this.treeTypes = this.data.treeTypes;
  }

  submit () {
    if ( this.form.invalid ) return;

    this.dialogRef.close( this.form.value );
  }

  close () {
    this.dialogRef.close( null );
  }
}
