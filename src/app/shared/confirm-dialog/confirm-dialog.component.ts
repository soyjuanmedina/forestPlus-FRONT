import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component( {
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ]
} )
export class ConfirmDialogComponent {
  constructor (
    @Inject( MAT_DIALOG_DATA ) public data: { title: string; message: string },
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) { }

  onConfirm (): void {
    this.dialogRef.close( true );
  }

  onCancel (): void {
    this.dialogRef.close( false );
  }
}
