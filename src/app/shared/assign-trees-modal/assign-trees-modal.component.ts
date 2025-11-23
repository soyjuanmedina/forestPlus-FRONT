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
  unassignedTrees: TreeResponseDto[] = [];

  constructor (
    private fb: FormBuilder,
    private landService: LandService,
    private treeService: TreeService,
    public dialogRef: MatDialogRef<AssignTreesModalComponent>,
    @Inject( MAT_DIALOG_DATA ) public data: { userId: number }
  ) {
    this.form = this.fb.group( {
      landId: [null, Validators.required],
      treeId: [null, Validators.required]
    } );
  }

  ngOnInit () {
    // Cargar todos los terrenos
    this.landService.getAllLands().subscribe( lands => this.lands = lands );
  }

  onLandChange ( event: Event ) {
    const value = Number( ( event.target as HTMLSelectElement ).value );
    // Cargar árboles sin propietario del terreno seleccionado
    this.treeService.getUnassignedTreesByLand( value )
      .subscribe( trees => this.unassignedTrees = trees );
  }

  submit () {
    if ( !this.form.valid ) return;

    const payload = {
      userId: this.data.userId,
      treeId: this.form.value.treeId
    };

    // Cerrar modal y devolver datos al componente padre
    this.dialogRef.close( payload );
  }
}
