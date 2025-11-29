import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component( {
  selector: 'app-land-info-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './land-info-modal.component.html'
} )
export class LandInfoModalComponent {
  constructor (
    @Inject( MAT_DIALOG_DATA ) public data: any
  ) { }
}