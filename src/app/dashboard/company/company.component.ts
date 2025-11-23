import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend, Plugin } from 'chart.js';
import { UserService } from '../../services/user.service';
import { CompanyService } from '../../services/company.service';
import { TranslateModule } from '@ngx-translate/core';
import { TreeService } from '../../services/tree.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AssignTreesModalComponent } from '../../shared/assign-trees-modal/assign-trees-modal.component';

@Component( {
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule, TranslateModule],
  templateUrl: './company.component.html'
} )
export class CompanyComponent implements OnInit, AfterViewInit {

  user: any;
  company: any;
  co2Years: any[] = [];
  chartsMap: { [key: string]: Chart } = {};
  previewImage?: string;
  isEditable: boolean = false;
  isAdmin = false;
  companyTrees: any[] = [];

  constructor (
    private userService: UserService,
    private companyService: CompanyService,
    private treeService: TreeService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    Chart.register( DoughnutController, ArcElement, Tooltip, Legend );
  }

  ngOnInit (): void {
    const companyIdParam = this.route.snapshot.paramMap.get( 'id' );

    if ( companyIdParam ) {
      this.isEditable = true;
      this.checkRole();
      this.companyService.getCompanyById( +companyIdParam ).subscribe( {
        next: ( c ) => {
          this.company = c;
          if ( this.company ) {
            this.prepareCO2Years();
            this.loadCompanyTrees();
          }
        },
        error: ( err ) => {
          console.error( 'Error cargando la compañía por ID:', err );
        }
      } );
    } else {
      this.userService.getUser().subscribe( {
        next: ( user ) => {
          this.user = user;
          this.checkRole();

          if ( user?.company?.id ) {
            this.companyService.getCompanyById( user.company.id ).subscribe( {
              next: ( c ) => {
                this.company = c;
                if ( this.company ) {
                  this.prepareCO2Years();
                  this.loadCompanyTrees();
                }
              },
              error: ( err ) => {
                console.error( 'Error cargando la compañía del usuario:', err );
              }
            } );
          } else {
            console.warn( 'El usuario no tiene compañía asignada' );
          }
        },
        error: ( err ) => {
          console.error( 'Error cargando el usuario:', err );
        }
      } );
    }
  }

  openAssignTreesModal ( companyId: number ) {
    // Abrimos el modal pasando solo el companyId
    const dialogRef = this.dialog.open( AssignTreesModalComponent, {
      width: '400px',
      data: { companyId }
    } );

    dialogRef.afterClosed().subscribe( result => {
      if ( result && result.treeId ) {
        this.treeService.assignTreeToUser( result.treeId, companyId )
          .subscribe( () => {
            this.loadCompanyTrees();
          } );
      }
    } );
  }

  checkRole () {
    const role = this.authService.currentUserRole;
    this.isAdmin = role === 'ADMIN';
  }

  ngAfterViewInit (): void {
    if ( this.co2Years?.length ) {
      setTimeout( () => this.renderCO2Charts(), 50 );
    }
  }

  // NUEVO: carga los árboles que pertenecen a la compañía
  loadCompanyTrees () {
    const companyId = this.company?.id || this.user?.company?.id;
    if ( !companyId ) return;

    this.treeService.getTreesByOwner( undefined, companyId ).subscribe( {
      next: trees => this.companyTrees = trees,
      error: err => console.error( 'Error cargando árboles de la compañía:', err )
    } );
  }

  prepareCO2Years (): void {
    if ( !this.company?.co2?.length ) return;

    const sorted = [...this.company.co2]
      .filter( y => y.year !== undefined )
      .sort( ( a, b ) => b.year! - a.year! );

    this.co2Years = sorted.map( y => ( {
      ...y,
      totalEmissions: y.totalEmissions || 0,
      totalCompensations: y.totalCompensations || 0,
      net: ( y.totalEmissions || 0 ) - ( y.totalCompensations || 0 ),
      emitidoRef: `emitido-${y.year}`,
      compensadoRef: `compensado-${y.year}`,
      netoRef: `neto-${y.year}`
    } ) );

    this.cdr.detectChanges();
    setTimeout( () => this.renderCO2Charts(), 100 );
  }

  goToEditForm () {
    const id = this.company?.id || this.user?.company?.id;
    if ( id ) {
      this.router.navigate( ['/company/form', id] );
    }
  }

  renderCO2Charts () {
    this.co2Years.forEach( ( y, i ) => {
      ( ['emitidoRef', 'compensadoRef', 'netoRef'] as const ).forEach( key => {
        const canvasEl = document.getElementById( y[key] ) as HTMLCanvasElement;
        if ( !canvasEl ) return;

        const size = i === 0 ? 200 : 80;
        canvasEl.width = size;
        canvasEl.height = size;

        const value = key === 'emitidoRef'
          ? y.totalEmissions
          : key === 'compensadoRef'
            ? y.totalCompensations
            : y.net;

        const color = key === 'emitidoRef'
          ? '#fc4d03ff'
          : key === 'compensadoRef'
            ? '#89de8cff'
            : '#2c80c5cf';

        this.createDonutChart( canvasEl, value, color, y.totalEmissions || 1 );
      } );
    } );
  }

  private createDonutChart ( canvas: HTMLCanvasElement, value: number, color: string, totalEmissions: number ) {
    const ctx = canvas.getContext( '2d' );
    if ( !ctx ) return;

    if ( this.chartsMap[canvas.id] ) this.chartsMap[canvas.id].destroy();

    const percent = ( value / ( totalEmissions > 0 ? totalEmissions : 1 ) ) * 100;

    const data = {
      datasets: [{
        data: [percent, 100 - percent],
        backgroundColor: [color, '#e0e0e0'],
        cutout: '75%',
        borderWidth: 0
      }]
    };

    const centerTextPlugin: Plugin<'doughnut'> = {
      id: 'centerText',
      beforeDraw: chart => {
        const { ctx, width, height } = chart;
        if ( !ctx ) return;
        ctx.save();
        ctx.font = `${( height / 100 ) * 20}px sans-serif`;
        ctx.fillStyle = '#333';
        ctx.textBaseline = 'middle';
        ctx.fillText( `${value}`, width / 2 - ctx.measureText( `${value}` ).width / 2, height / 2 - 10 );
        ctx.font = `${( height / 100 ) * 8}px sans-serif`;
        ctx.fillStyle = '#666';
        ctx.fillText( 'Toneladas de CO₂', width / 2 - ctx.measureText( 'Toneladas de CO₂' ).width / 2, height / 2 + 15 );
        ctx.restore();
      }
    };

    this.chartsMap[canvas.id] = new Chart( ctx, {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { animateRotate: true, animateScale: true }
      },
      plugins: [centerTextPlugin]
    } );
  }

  getNetColorClass ( totalEmissions: number, totalCompensations: number ): string {
    const net = totalEmissions - totalCompensations;
    const ratio = totalEmissions > 0 ? net / totalEmissions : 1;
    if ( ratio < 0.5 ) return 'net-yellow';
    if ( ratio <= 1 ) return 'net-red';
    return 'net-green';
  }

  getCompensatedPercentage ( totalEmissions: number, totalCompensations: number ): string {
    if ( !totalEmissions ) return '0';
    return ( ( totalCompensations / totalEmissions ) * 100 ).toFixed( 0 );
  }
}
