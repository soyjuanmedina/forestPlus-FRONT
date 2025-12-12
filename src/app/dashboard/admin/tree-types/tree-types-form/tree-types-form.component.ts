import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TreeTypeResponseDto } from '../../../../api/model/treeTypeResponse';
import { TreeTypeService } from '../../../../services/tree-type.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component( {
  selector: 'app-tree-types-form',
  standalone: true,
  templateUrl: './tree-types-form.component.html',
  styleUrls: ['./tree-types-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule, // <--- esto es necesario
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    TranslateModule
  ]
} )
export class TreeTypesFormComponent implements OnInit {

  treeTypeForm!: FormGroup;
  treeType!: TreeTypeResponseDto;
  previewImage: string | null = null;

  constructor (
    private fb: FormBuilder,
    private treeTypeService: TreeTypeService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit (): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get( 'id' );
    if ( id ) {
      this.loadTreeType( +id );
    } else {
      this.treeType = {} as TreeTypeResponseDto; // Nuevo tipo de árbol
    }
  }

  private initForm (): void {
    this.treeTypeForm = this.fb.group( {
      name: ['', Validators.required], // Obligatorio
      scientificName: [null],          // Permitido nulo
      description: [null],             // Permitido nulo

      // CO₂ estimaciones (permiten nulo)
      co2AbsorptionAt20: [null],
      co2AbsorptionAt25: [null],
      co2AbsorptionAt30: [null],
      co2AbsorptionAt35: [null],
      co2AbsorptionAt40: [null],

      // Altura y esperanza de vida (permiten nulo)
      typicalHeight: [null],
      lifespanYears: [null],
    } );
  }

  private loadTreeType ( id: number ): void {
    this.treeTypeService.getTreeTypeById( id ).subscribe( {
      next: ( treeType ) => {
        this.treeType = treeType;
        this.treeTypeForm.patchValue( {
          name: treeType.name,
          scientificName: treeType.scientificName, // Nuevo campo
          description: treeType.description,
          co2AbsorptionAt20: treeType.co2AbsorptionAt20,
          co2AbsorptionAt25: treeType.co2AbsorptionAt25,
          co2AbsorptionAt30: treeType.co2AbsorptionAt30,
          co2AbsorptionAt35: treeType.co2AbsorptionAt35,
          co2AbsorptionAt40: treeType.co2AbsorptionAt40,
          typicalHeight: treeType.typicalHeight,
          lifespanYears: treeType.lifespanYears,
        } );
      },
      error: ( err ) => {
        console.error( 'Error al cargar el tipo de árbol', err );
        this.snackBar.open( '❌ Error al cargar el tipo de árbol', 'Cerrar', { duration: 3000 } );
      }
    } );
  }

  onTreeTypeFileSelected ( event: Event ): void {
    const input = event.target as HTMLInputElement;
    if ( !input.files?.length ) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.previewImage = reader.result as string;
    reader.readAsDataURL( file );

    if ( this.treeType?.id ) {
      this.treeTypeService.updateTreeTypePicture( this.treeType.id, file ).subscribe( {
        next: ( updated ) => {
          this.treeType = updated;
          this.snackBar.open( '✅ Imagen actualizada', 'Cerrar', { duration: 3000 } );
        },
        error: ( err ) => {
          console.error( 'Error al actualizar la imagen', err );
          this.snackBar.open( '❌ Error al actualizar la imagen', 'Cerrar', { duration: 3000 } );
        }
      } );
    }
  }

  onSubmitTreeType (): void {
    console.log( 'onSubmitTreeType', );
    if ( this.treeTypeForm.invalid ) return;

    const formValue = this.treeTypeForm.value;

    console.log( 'formValue', formValue );

    if ( this.treeType?.id ) {
      this.treeTypeService.updateTreeType( this.treeType.id, formValue ).subscribe( {
        next: () => {
          this.snackBar.open( '✅ Tipo de árbol actualizado', 'Cerrar', { duration: 3000 } );
          this.router.navigate( ['/tree-type/', this.treeType.id] );
        },
        error: ( err ) => {
          console.error( 'Error al actualizar el tipo de árbol', err );
          this.snackBar.open( '❌ Error al actualizar el tipo de árbol', 'Cerrar', { duration: 3000 } );
        }
      } );
    } else {
      this.treeTypeService.createTreeType( formValue ).subscribe( {
        next: () => {
          this.snackBar.open( '✅ Tipo de árbol creado', 'Cerrar', { duration: 3000 } );
          this.router.navigate( ['/admin/tree-types'] );
        },
        error: ( err ) => {
          console.error( 'Error al crear el tipo de árbol', err );
          this.snackBar.open( '❌ Error al crear el tipo de árbol', 'Cerrar', { duration: 3000 } );
        }
      } );
    }
  }

  cancel (): void {
    this.router.navigate( ['/admin/tree-types'] );
  }

}
