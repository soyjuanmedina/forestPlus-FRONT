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
import { CoordinateService } from '../../../services/coordinate.service';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';
import { LandResponseDto, LandRequestDto, LandUpdateRequestDto, UserResponseDto, CoordinateResponseDto, LandTreeSummaryResponseDto, PlannedPlantationResponseDto } from '../../../api';
import { AddCoordinateModalComponent } from '../../../modals/add-coordinate-modal/add-coordinate-modal.component';
import { PlannedPlantationService } from '../../../services/planned-plantation.service';
import { PlannedPlantationsListComponent } from '../../../shared/planned-plantations-list/planned-plantations-list.component';

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
    TranslateModule,
    PlannedPlantationsListComponent
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
  plannedPlantations: PlannedPlantationResponseDto[] = [];

  private destroy$ = new Subject<void>();

  constructor (
    private fb: FormBuilder,
    private landService: LandService,
    private plannedPlantationService: PlannedPlantationService,
    private coordinateService: CoordinateService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
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
      description: [''],
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
        description: l.description,
        location: l.location,
        area: l.area,
        maxTrees: l.maxTrees
      } );
      this.previewImage = l.picture;

      this.loadCoordinates();
      this.loadPlannedPlantations();
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

    const rawValue = this.landForm.value;

    const sanitizedDescription = this.sanitizer.sanitize(
      SecurityContext.HTML,
      rawValue.description
    );

    const formValue = {
      ...rawValue,
      description: sanitizedDescription
    };
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

  private loadPlannedPlantations (): void {
    if ( !this.land?.id ) return;

    this.plannedPlantationService
      .getByLand( this.land.id )
      .subscribe( {
        next: ( pps ) => this.plannedPlantations = pps,
        error: ( err ) => console.error( 'Error cargando plantaciones', err )
      } );
  }

  onEditPlantation ( pp: PlannedPlantationResponseDto ): void {
    if ( !pp.id ) return;

    this.router.navigate( [
      '/admin/planned-plantation-form',
      pp.id
    ] );
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
