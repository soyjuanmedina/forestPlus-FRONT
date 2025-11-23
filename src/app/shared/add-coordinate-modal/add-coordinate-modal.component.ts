import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component( {
  selector: 'app-add-coordinate-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './add-coordinate-modal.component.html'
} )
export class AddCoordinateModalComponent {

  form: FormGroup;

  constructor (
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddCoordinateModalComponent>,
    @Inject( MAT_DIALOG_DATA ) public data: { landId: number }
  ) {
    this.form = this.fb.group( {
      lat: [null, Validators.required],
      lng: [null, Validators.required]
    } );
  }

  addCoordinate () {
    if ( this.form.invalid ) return;

    const coordinate = {
      latitude: this.form.value.lat,
      longitude: this.form.value.lng,
      landId: this.data.landId
    };

    this.dialogRef.close( coordinate );
  }
}
