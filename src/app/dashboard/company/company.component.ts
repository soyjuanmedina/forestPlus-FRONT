import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend, Plugin } from 'chart.js';
import { UserService } from '../../services/user.service';
import { CompanyService } from '../../services/company.service';

@Component( {
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
  templateUrl: './company.component.html'
} )
export class CompanyComponent implements OnInit, AfterViewInit {

  user: any;
  company: any;
  co2Years: any[] = [];
  chartsMap: { [key: string]: Chart } = {};
  previewImage?: string;

  constructor (
    private userService: UserService,
    private companyService: CompanyService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    Chart.register( DoughnutController, ArcElement, Tooltip, Legend );
  }

  ngOnInit (): void {
    this.userService.getUser().subscribe( user => {
      this.user = user;

      console.log( 'user', user );
      if ( user?.company?.id ) {
        this.companyService.getCompanyById( user.company.id ).subscribe( c => {
          this.company = c;
          this.prepareCO2Years();
        } );
      }
    } );
  }

  ngAfterViewInit (): void {
    if ( this.co2Years?.length ) {
      setTimeout( () => this.renderCO2Charts(), 50 );
    }
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
      netoRef: `neto-${y.year}`, // importante
    } ) );

    this.cdr.detectChanges();
    setTimeout( () => this.renderCO2Charts(), 100 );
  }

  goToEditForm () {
    console.log( 'this.user?.company?.id', this.user?.company?.id );
    if ( this.user?.company?.id ) {
      this.router.navigate( ['/company/form', this.user.company.id] );
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

    // Plugin para dibujar texto en el centro
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
