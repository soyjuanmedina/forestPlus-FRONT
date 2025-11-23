import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

import { LandService } from '../../services/land.service';
import { UserService } from '../../services/user.service';
import { RolesEnum } from '../../models/roles';
import { LandResponseDto } from '../../api/model/landResponse';
import { UserResponseDto } from '../../api/model/userResponse';
import { LandTreeSummaryResponseDto } from '../../api';
import { TreeService } from '../../services/tree.service';
import { CoordinateResponseDto } from '../../api/model/coordinateResponse';
import { CoordinateService } from '../../services/coordinate.service';

@Component( {
  selector: 'app-land',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './land.component.html',
  styleUrls: ['./land.component.scss']
} )
export class LandComponent implements OnInit {

  land!: LandResponseDto;
  previewImage: string | null = null;
  user: UserResponseDto | null = null;
  isEditable = false;
  plantedTrees: LandTreeSummaryResponseDto[] = [];
  coordinates: CoordinateResponseDto[] = []; // ✅ Coordenadas

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private landService: LandService,
    private treeService: TreeService,
    private coordinateService: CoordinateService, // ✅ Servicio de coordenadas
    private snackBar: MatSnackBar,
    private userService: UserService
  ) { }

  ngOnInit (): void {
    const id = this.route.snapshot.paramMap.get( 'id' );
    this.user = this.userService.getCurrentUser();

    if ( id ) {
      this.landService.getLandById( +id ).subscribe( {
        next: ( land ) => {
          this.land = land;
          this.previewImage = land.picture || null;
          this.isEditable = this.user?.role === RolesEnum.ADMIN;
          this.loadPlantedTrees();
          this.loadCoordinates(); // ✅ Cargar coordenadas
        },
        error: ( err ) => {
          console.error( '❌ Error al cargar el terreno', err );
          this.snackBar.open( 'Error al cargar el terreno', 'Cerrar', { duration: 3000 } );
        }
      } );
    }
  }

  goToEditForm (): void {
    if ( this.land?.id ) {
      this.router.navigate( ['/admin/land-form', this.land.id] );
    }
  }

  private loadPlantedTrees () {
    if ( !this.land?.id ) return;

    this.treeService.getTreesByLand( this.land.id ).subscribe( {
      next: ( trees: LandTreeSummaryResponseDto[] ) => {
        this.plantedTrees = trees;
        console.log( 'trees', trees );
      },
      error: ( err ) => {
        console.error( 'Error cargando árboles plantados', err );
        this.snackBar.open( 'Error cargando árboles plantados', 'Cerrar', { duration: 3000 } );
      }
    } );
  }

  // ------------------------------
  // ✅ Nuevo: cargar coordenadas
  // ------------------------------
  private loadCoordinates () {
    if ( !this.land?.id ) return;

    this.coordinateService.getCoordinatesByLand( this.land.id ).subscribe( {
      next: ( coords: CoordinateResponseDto[] ) => {
        this.coordinates = coords;
        console.log( 'coordinates', coords );
      },
      error: ( err ) => {
        console.error( 'Error cargando coordenadas', err );
        this.snackBar.open( 'Error cargando coordenadas', 'Cerrar', { duration: 3000 } );
      }
    } );
  }
}
