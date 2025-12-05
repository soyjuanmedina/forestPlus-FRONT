import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component( {
  selector: 'app-tree-type-info-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './tree-type-info-modal.component.html'
} )
export class TreeTypeInfoModalComponent {
  constructor (
    @Inject( MAT_DIALOG_DATA ) public data: any
  ) { }
}
