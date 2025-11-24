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
export class LandComponent implements OnInit, AfterViewInit {

  land!: LandResponseDto;
  previewImage: string | null = null;
  user: UserResponseDto | null = null;
  isEditable = false;
  plantedTrees: LandTreeSummaryResponseDto[] = [];
  coordinates: CoordinateResponseDto[] = [];
  private map!: maplibregl.Map;

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private landService: LandService,
    private treeService: TreeService,
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
          this.loadPlantedTrees();
          this.loadCoordinates();
        },
        error: ( err ) => {
          console.error( '❌ Error al cargar el terreno', err );
          this.snackBar.open( 'Error al cargar el terreno', 'Cerrar', { duration: 3000 } );
        }
      } );
    }
  }

  ngAfterViewInit (): void {
    this.initMap();
  }

  private initMap (): void {
    // Inicializa el mapa centrado en El Ejido
    this.map = new maplibregl.Map( {
      container: 'map',
      style: 'https://api.maptiler.com/maps/streets/style.json?key=sdnUoYHqfQl85tCCphh6',
      center: [-2.7936, 36.8186],
      zoom: 13,
      interactive: true
    } );
  }

  private loadCoordinates (): void {
    if ( !this.land?.id ) return;

    this.coordinateService.getCoordinatesByLand( this.land.id ).subscribe( {
      next: ( coords: CoordinateResponseDto[] ) => {
        this.coordinates = coords;
        this.drawLandPolygon();
      },
      error: ( err ) => {
        console.error( 'Error cargando coordenadas', err );
        this.snackBar.open( 'Error cargando coordenadas', 'Cerrar', { duration: 3000 } );
      }
    } );
  }

  private drawLandPolygon (): void {
    if ( !this.map ) return;

    if ( this.coordinates.length > 0 ) {
      const coords = this.coordinates
        .filter( c => c.latitude != null && c.longitude != null )
        .map( c => [c.longitude!, c.latitude!] as [number, number] );

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
      },
      error: ( err ) => {
        console.error( 'Error cargando árboles plantados', err );
        this.snackBar.open( 'Error cargando árboles plantados', 'Cerrar', { duration: 3000 } );
      }
    } );
  }
}
