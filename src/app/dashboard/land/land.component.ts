import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import maplibregl from 'maplibre-gl';
import { LandService } from '../../services/land.service';
import { UserService } from '../../services/user.service';
import { RolesEnum } from '../../models/roles';
import { LandResponseDto } from '../../api/model/landResponse';
import { UserResponseDto } from '../../api/model/userResponse';
import { LandTreeSummaryResponseDto, PlannedPlantationResponseDto } from '../../api';
import { TreeService } from '../../services/tree.service';
import { CoordinateResponseDto } from '../../api/model/coordinateResponse';
import { CoordinateService } from '../../services/coordinate.service';
import { PlannedPlantationService } from '../../services/planned-plantation.service';
import { PlannedPlantationsListComponent } from '../../shared/planned-plantations-list/planned-plantations-list.component';

@Component( {
  selector: 'app-land',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslateModule, PlannedPlantationsListComponent],
  templateUrl: './land.component.html',
  styleUrls: ['./land.component.scss']
} )
export class LandComponent implements OnInit {

  land!: LandResponseDto;
  previewImage: string | null = null;
  user: UserResponseDto | null = null;
  isEditable = false;
  plannedPlantations: PlannedPlantationResponseDto[] = [];
  coordinates: CoordinateResponseDto[] = [];
  private map!: maplibregl.Map;

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private landService: LandService,
    private plannedPlantationService: PlannedPlantationService,
    private coordinateService: CoordinateService,
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
          setTimeout( () => this.initMap(), 0 );

          this.loadPlannedPlantations();
          this.loadCoordinates();
        },
        error: ( err ) => {
          console.error( '❌ Error al cargar el terreno', err );
          this.snackBar.open( 'Error al cargar el terreno', 'Cerrar', { duration: 3000 } );
        }
      } );
    }
  }

  private initMap (): void {
    if ( this.map ) return; // evitar crear 2 mapas

    this.map = new maplibregl.Map( {
      container: 'map',
      style: 'https://api.maptiler.com/maps/streets/style.json?key=sdnUoYHqfQl85tCCphh6',
      zoom: 13,
      interactive: true
    } );

    // Esperar a que cargue el mapa antes de dibujar
    this.map.on( 'load', () => {
      this.drawLandPolygon();
    } );
  }

  private loadCoordinates (): void {
    if ( !this.land?.id ) return;

    this.coordinateService.getCoordinatesByLand( this.land.id ).subscribe( {
      next: ( coords ) => {
        this.coordinates = coords;

        // Si el mapa está cargado, dibuja.
        if ( this.map && this.map.isStyleLoaded() ) {
          this.drawLandPolygon();
        }
      },
      error: ( err ) => {
        console.error( 'Error cargando coordenadas', err );
      }
    } );
  }

  private drawLandPolygon (): void {
    if ( !this.map ) return;

    if ( this.coordinates.length > 0 ) {
      let coords = this.coordinates
        .filter( c => c.latitude != null && c.longitude != null )
        .map( c => [c.longitude!, c.latitude!] as [number, number] );

      coords = this.orderPolygonCoords( coords ); // <-- ORDENAR AQUÍ

      if ( coords.length > 0 ) {
        coords.push( coords[0] ); // cerrar polígono

        // Fuente
        this.map.addSource( 'land-polygon', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [coords]
            },
            properties: {} // ✅ propiedades vacías necesarias
          } as GeoJSON.Feature<GeoJSON.Polygon, {}> // cast explícito
        } );

        // Relleno
        this.map.addLayer( {
          id: 'land-polygon-fill',
          type: 'fill',
          source: 'land-polygon',
          layout: {},
          paint: {
            'fill-color': '#00ff00',
            'fill-opacity': 0.3
          }
        } );

        // Contorno
        this.map.addLayer( {
          id: 'land-polygon-outline',
          type: 'line',
          source: 'land-polygon',
          layout: {},
          paint: {
            'line-color': '#00aa00',
            'line-width': 2
          }
        } );

        // Centrar mapa en primera coordenada
        this.map.setCenter( coords[0] );
      }
    }
  }

  // Ordenar coordenadas en sentido horario alrededor del centroide
  private orderPolygonCoords ( coords: [number, number][] ): [number, number][] {
    // Calcular centroide
    const centroid = coords.reduce(
      ( acc, val ) => [acc[0] + val[0] / coords.length, acc[1] + val[1] / coords.length],
      [0, 0]
    );

    // Ordenar por ángulo
    return coords
      .map( ( coord ) => ( {
        coord,
        angle: Math.atan2( coord[1] - centroid[1], coord[0] - centroid[0] ),
      } ) )
      .sort( ( a, b ) => a.angle - b.angle )
      .map( ( item ) => item.coord );
  }


  goToEditForm (): void {
    if ( this.land?.id ) {
      this.router.navigate( ['/admin/land-form', this.land.id] );
    }
  }

  private loadPlannedPlantations (): void {
    if ( !this.land?.id ) return;

    this.plannedPlantationService
      .getByLand( this.land.id )
      .subscribe( {
        next: ( plantations ) => {
          this.plannedPlantations = plantations ?? [];
        },
        error: ( err ) => {
          console.error( 'Error cargando plantaciones planificadas', err );
          this.snackBar.open(
            'Error cargando plantaciones planificadas',
            'Cerrar',
            { duration: 3000 }
          );
        }
      } );
  }
}
