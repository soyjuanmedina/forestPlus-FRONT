import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { LandService } from '../../../services/land.service';
import { UserService } from '../../../services/user.service';
import { TreeService } from '../../../services/tree.service';
import { CoordinateService } from '../../../services/coordinate.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LandResponseDto, LandRequestDto, LandUpdateRequestDto, UserResponseDto, CoordinateResponseDto, LandTreeSummaryResponseDto } from '../../../api';
import { PlantTreesModalComponent } from '../../../modals/plant-trees-modal/plant-trees-modal.component';
import { AddCoordinateModalComponent } from '../../../modals/add-coordinate-modal/add-coordinate-modal.component';
import { TreeTypeService } from '../../../services/tree-type.service';
import { PlannedPlantationService } from '../../../services/planned-plantation.service';

@Component( {
  selector: 'app-land-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './land-form.component.html',
} )
export class LandFormComponent implements OnInit, OnDestroy {

  landForm!: FormGroup;
  land: LandResponseDto | null = null;
  previewImage?: string;
  selectedFile?: File;
  user?: UserResponseDto | null;

  coordinates: CoordinateResponseDto[] = [];
  plantedTrees: LandTreeSummaryResponseDto[] = [];

  private destroy$ = new Subject<void>();

  constructor (
    private fb: FormBuilder,
    private landService: LandService,
    private plannedPlantationService: PlannedPlantationService,
    private coordinateService: CoordinateService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private treeService: TreeService,
    private treeTypeService: TreeTypeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit () {
    this.initForm();

    const id = Number( this.route.snapshot.paramMap.get( 'id' ) );
    if ( id ) this.loadLand( id );

    this.userService.getUser().pipe( takeUntil( this.destroy$ ) )
      .subscribe( user => this.user = user );
  }

  ngOnDestroy () {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** ------------------ FORMULARIO ------------------ */
  private initForm () {
    this.landForm = this.fb.group( {
      name: ['', Validators.required],
      location: [''],
      area: [0, Validators.required],
      maxTrees: [0]
    } );
  }

  private loadLand ( id: number ) {
    this.landService.getLandById( id ).pipe( takeUntil( this.destroy$ ) ).subscribe( l => {
      this.land = l;
      this.landForm.patchValue( {
        name: l.name,
        location: l.location,
        area: l.area,
        maxTrees: l.maxTrees
      } );
      this.previewImage = l.picture;

      this.loadCoordinates();
      this.loadPlantedTrees( id );
    } );
  }

  onFileSelected ( event: any ) {
    const file: File = event.target.files[0];
    if ( !file ) return;
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => this.previewImage = reader.result as string;
    reader.readAsDataURL( file );
  }

  onSubmitLand () {
    if ( this.landForm.invalid ) return;

    const formValue = this.landForm.value;
    const requests = [];

    if ( !this.land?.id ) {
      const dto: LandRequestDto = {
        ...formValue,
        userIds: [],
        companyIds: [],
        picture: this.previewImage
      };
      requests.push( this.landService.createLand( dto ) );
    } else {
      const updateDto: LandUpdateRequestDto = { ...formValue, picture: this.previewImage };
      requests.push( this.landService.updateLand( this.land.id, updateDto ) );
    }

    forkJoin( requests ).pipe( takeUntil( this.destroy$ ) ).subscribe( results => {
      const updated = results[results.length - 1];
      if ( !updated ) return;

      this.land = updated;
      this.landForm.patchValue( {
        name: updated.name,
        location: updated.location,
        area: updated.area,
        maxTrees: updated.maxTrees
      } );
      this.previewImage = updated.picture;
      this.selectedFile = undefined;

      if ( this.user ) {
        if ( this.user.role === 'ADMIN' ) this.router.navigate( ['/admin/lands'] );
        else if ( this.user.role === 'COMPANY_ADMIN' ) this.router.navigate( ['/land'] );
        else this.router.navigate( ['/home'] );
      }
    } );
  }

  cancel () {
    if ( !this.user ) return;
    if ( this.user.role === 'ADMIN' ) this.router.navigate( ['/admin/lands'] );
    else if ( this.user.role === 'COMPANY_ADMIN' ) this.router.navigate( ['/land'] );
    else this.router.navigate( ['/home'] );
  }

  /** ------------------ COORDENADAS ------------------ */
  private loadCoordinates () {
    if ( !this.land?.id ) return;
    this.landService.getCoordinatesByLand( this.land.id )
      .pipe( takeUntil( this.destroy$ ) )
      .subscribe( coords => this.coordinates = coords );
  }

  openAddCoordinateModal () {
    if ( !this.land?.id ) return;

    const dialogRef = this.dialog.open( AddCoordinateModalComponent, {
      width: '400px',
      data: { landId: this.land.id }
    } );

    dialogRef.afterClosed().subscribe( result => {
      if ( result ) {
        this.saveCoordinate( { ...result } );
      }
    } );
  }

  private saveCoordinate ( coord: { latitude: number; longitude: number; landId: number } ) {

    this.coordinateService.createCoordinate( coord ).subscribe( {
      next: saved => this.coordinates.push( saved ),
      error: err => console.error( 'Error al guardar coordenada', err )
    } );
  }

  /** ------------------ ÁRBOLES ------------------ */
  private loadPlantedTrees ( landId: number ) {
    this.treeService.getTreesByLand( landId ).subscribe( {
      next: ( trees: LandTreeSummaryResponseDto[] ) => this.plantedTrees = trees,
      error: err => this.snackBar.open( 'Error cargando árboles plantados', 'Cerrar', { duration: 3000 } )
    } );
  }

  openPlantTreesModal () {
    if ( !this.land?.id ) return;

    // 1️⃣ Obtener tipos de árboles
    this.treeTypeService.getAllTreeTypes().pipe( takeUntil( this.destroy$ ) ).subscribe( {
      next: ( types ) => {

        // 2️⃣ Obtener plantaciones planificadas del terreno
        this.plannedPlantationService.getByLand( this.land!.id! ).pipe( takeUntil( this.destroy$ ) ).subscribe( {
          next: ( plantations ) => {

            // 3️⃣ Abrir el modal pasando ambos datos
            const dialogRef = this.dialog.open( PlantTreesModalComponent, {
              width: '400px',
              data: { treeTypes: types, plannedPlantations: plantations }
            } );

            // 4️⃣ Después de cerrar el modal, plantar los árboles
            dialogRef.afterClosed().subscribe( result => {
              if ( result && this.land?.id ) {
                this.treeService.plantTreeBatch( {
                  landId: this.land.id,
                  treeTypeId: result.treeTypeId,
                  quantity: result.quantity,
                  plannedPlantationId: result.plannedPlantationId // 🔹 enviar plantación seleccionada
                } ).subscribe( () => this.loadPlantedTrees( this.land!.id! ) );
              }
            } );

          },
          error: ( err ) => console.error( 'Error cargando plantaciones planificadas', err )
        } );

      },
      error: ( err ) => console.error( 'Error cargando tipos de árboles', err )
    } );
  }

  editPlantedTrees ( plantedTrees: LandTreeSummaryResponseDto ) {
    this.router.navigate( ['/land/edit-trees', this.land?.id, plantedTrees.treeTypeId] );
  }

  deleteCoordinate ( coord: CoordinateResponseDto ) {
    if ( !coord.id ) {
      console.error( "La coordenada no tiene ID, no se puede eliminar" );
      return;
    }
    this.coordinateService.deleteCoordinate( coord.id ).subscribe( {
      next: () => this.loadCoordinates(),
      error: err => console.error( 'Error al guardar coordenada', err )
    } );
  }

}
