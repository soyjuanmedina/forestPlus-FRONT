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
      name: ['', Validators.required],
      description: [''],
      co2Absorption: [0, [Validators.required, Validators.min( 0 )]],
      typicalHeight: [0, [Validators.required, Validators.min( 0 )]],
      lifespanYears: [0, [Validators.required, Validators.min( 1 )]]
    } );
  }

  private loadTreeType ( id: number ): void {
    this.treeTypeService.getTreeTypeById( id ).subscribe( {
      next: ( treeType ) => {
        this.treeType = treeType;
        this.treeTypeForm.patchValue( {
          name: treeType.name,
          description: treeType.description,
          co2Absorption: treeType.co2Absorption,
          typicalHeight: treeType.typicalHeight,
          lifespanYears: treeType.lifespanYears
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
    if ( this.treeTypeForm.invalid ) return;

    const formValue = this.treeTypeForm.value;

    console.log( 'formValue', formValue );

    if ( this.treeType?.id ) {
      this.treeTypeService.updateTreeType( this.treeType.id, formValue ).subscribe( {
        next: () => {
          this.snackBar.open( '✅ Tipo de árbol actualizado', 'Cerrar', { duration: 3000 } );
          this.router.navigate( ['/admin/tree-types'] );
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
