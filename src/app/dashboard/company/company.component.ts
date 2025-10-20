import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../../services/user.service';
import { CompanyService } from '../../services/company.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, ChartConfiguration, Plugin, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { CompanyCO2YearlyRequestDto, CompanyResponseDto } from '../../api';
import { CompanyCo2Service } from '../../services/company-co2.service';

@Component( {
  selector: 'app-company',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
} )
export class CompanyComponent implements OnInit, AfterViewInit {

  @ViewChild( 'emitidoChart' ) emitidoCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild( 'compensadoChart' ) compensadoCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild( 'netoChart' ) netoCanvas!: ElementRef<HTMLCanvasElement>;

  user: any;
  editMode = false;
  editData: any = {};
  selectedFile?: File;
  previewImage?: string;

  lastCO2Year?: any;
  totalCO2?: number;

  chartsMap: { [key: string]: Chart } = {};


  co2Years: any[] = [];

  previousCO2: {
    year: number,
    emissions: number,
    compensations: number,
    net: number,
    emitidoRef: string,
    compensadoRef: string,
    netoRef: string
  }[] = [];
  company: CompanyResponseDto | null = null;

  constructor (
    private userService: UserService,
    private companyService: CompanyService,
    private companyCo2Service: CompanyCo2Service
  ) {
    // Registrar controllers de Chart.js
    Chart.register( DoughnutController, ArcElement, Tooltip, Legend );
  }

  ngOnInit (): void {
    this.userService.getUser().subscribe( user => {
      this.user = user;
      if ( user?.company?.id ) {
        this.companyService.getCompanyById( user.company.id )
          .subscribe( company => {
            this.user.company = company;
            this.editData = { ...company };
            this.updateLastCO2Year();
          } );
      }
    } );
  }

  ngAfterViewInit () {
    // Los charts se crearán desde updateLastCO2Year()
  }

  private createDonutChart (
    canvas: HTMLCanvasElement,
    value: number,
    color: string,
    totalEmissions: number
  ) {
    const ctx = canvas.getContext( '2d' );
    if ( !ctx ) return;

    // 🔹 destruir chart previo si existe
    if ( this.chartsMap[canvas.id] ) {
      this.chartsMap[canvas.id].destroy();
    }

    const centerTextPlugin: Plugin<'doughnut', any> = {
      id: 'centerText',
      beforeDraw: ( chart ) => {
        const { ctx, width, height } = chart;
        if ( !ctx ) return;

        ctx.save();
        const line1 = `${value}`;
        const line2 = 'Toneladas de CO₂';
        const fontSize1 = ( height / 100 ) * 20;
        ctx.font = `${fontSize1}px sans-serif`;
        ctx.fillStyle = '#333';
        ctx.textBaseline = 'middle';
        const textX1 = width / 2 - ctx.measureText( line1 ).width / 2;
        const textY1 = height / 2 - 10;
        ctx.fillText( line1, textX1, textY1 );

        const fontSize2 = ( height / 100 ) * 8;
        ctx.font = `${fontSize2}px sans-serif`;
        ctx.fillStyle = '#666';
        const textX2 = width / 2 - ctx.measureText( line2 ).width / 2;
        const textY2 = height / 2 + 15;
        ctx.fillText( line2, textX2, textY2 );

        ctx.restore();
      },
    };

    const base = totalEmissions > 0 ? totalEmissions : 1;
    const isEmissions = value === totalEmissions;
    const initialPercent = isEmissions ? 100 : ( value / base ) * 100;

    const data = {
      datasets: [
        {
          data: [initialPercent, 100 - initialPercent],
          backgroundColor: [color, '#e0e0e0'],
          cutout: '75%',
          borderWidth: 0,
        },
      ],
    };

    const options: ChartConfiguration<'doughnut'>['options'] = {
      responsive: true,
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: isEmissions ? 0 : 3000,
      },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    };

    // 🔹 crear chart y guardarlo
    this.chartsMap[canvas.id] = new Chart( ctx, {
      type: 'doughnut',
      data,
      options,
      plugins: [centerTextPlugin],
    } );
  }



  private updateLastCO2Year () {
    if ( !this.user?.company?.co2?.length ) return;

    const sorted = [...this.user.company.co2].sort( ( a, b ) => b.year - a.year );

    this.co2Years = sorted.map( y => ( {
      ...y,
      emitidoRef: `emitido-${y.year}`,
      compensadoRef: `compensado-${y.year}`,
      netoRef: `neto-${y.year}`,
      net: ( y.totalEmissions || 0 ) - ( y.totalCompensations || 0 ),
      editEmissions: y.totalEmissions || 0,
      editCompensations: y.totalCompensations || 0,
      editMode: false
    } ) );

    setTimeout( () => {
      this.co2Years.forEach( y => {
        ( ['emitidoRef', 'compensadoRef', 'netoRef'] as const ).forEach( key => {
          const canvasEl = document.getElementById( y[key] ) as HTMLCanvasElement;
          if ( canvasEl ) {
            const value =
              key === 'emitidoRef' ? y.totalEmissions :
                key === 'compensadoRef' ? y.totalCompensations :
                  y.net;
            const color =
              key === 'emitidoRef' ? '#fc4d03ff' :
                key === 'compensadoRef' ? '#89de8cff' :
                  '#2c80c5cf';
            this.createDonutChart( canvasEl, value, color, y.emissions || y.totalEmissions || 0 );
          }
        } );
      } );
    } );
  }



  toggleEdit (): void {
    if ( this.user?.company ) this.editData = { ...this.user.company };
    this.editMode = !this.editMode;
  }

  onFileSelected ( event: any ): void {
    const file: File = event.target.files[0];
    if ( file ) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.previewImage = reader.result as string;
      reader.readAsDataURL( file );
    }
  }

  saveChanges (): void {
    if ( !this.user?.company?.id ) return;

    const updateDto = { name: this.editData.name, address: this.editData.address };
    const requests = [];

    if ( this.selectedFile ) {
      requests.push(
        this.companyService.updateCompanyPicture( this.user.company.id, this.selectedFile )
          .pipe( catchError( err => { console.error( 'Error al subir imagen', err ); return of( this.user.company ); } ) )
      );
    }

    if ( updateDto.name || updateDto.address ) {
      requests.push(
        this.companyService.updateCompany( this.user.company.id, updateDto )
          .pipe( catchError( err => { console.error( 'Error al actualizar datos', err ); return of( this.user.company ); } ) )
      );
    }

    if ( requests.length === 0 ) {
      this.editMode = false;
      return;
    }

    forkJoin( requests ).subscribe( results => {
      const updatedCompany = results[results.length - 1];
      this.finalizeUpdate( updatedCompany );
      this.updateLastCO2Year();
    } );
  }

  private finalizeUpdate ( updatedCompany: any ) {
    if ( this.user ) {
      this.user.company = updatedCompany;
      this.userService.updateCurrentUser( this.user );
    }
    this.editMode = false;
    this.selectedFile = undefined;
    this.previewImage = undefined;
  }


  // Activar/desactivar edición por año
  toggleEditCO2 ( y: any ) {
    if ( !y.editMode ) {
      // Guardamos copia para poder cancelar
      y._backup = { emissions: y.emissions, compensations: y.compensations };
    } else {
      // Cancelar: restauramos valores
      if ( y._backup ) {
        y.emissions = y._backup.emissions;
        y.compensations = y._backup.compensations;
      }
      // Volvemos a pintar los charts
      setTimeout( () => this.paintCO2Charts( y ), 0 );
    }
    y.editMode = !y.editMode;
  }

  paintCO2Charts ( y: any ) {
    const emitted = y.emissions || 0;
    const compensated = y.compensations || 0;
    const net = emitted - compensated;

    const canvasIds = ['emitidoRef', 'compensadoRef', 'netoRef'] as const;
    canvasIds.forEach( key => {
      const canvasEl = document.getElementById( y[key] ) as HTMLCanvasElement;
      if ( !canvasEl ) return;
      const value = key === 'emitidoRef' ? emitted : key === 'compensadoRef' ? compensated : net;
      const color = key === 'emitidoRef' ? '#fc4d03ff' : key === 'compensadoRef' ? '#89de8cff' : '#2c80c5cf';
      this.createDonutChart( canvasEl, value, color, emitted );
    } );
  }


  saveCO2 ( year: any ) {
    if ( !this.user?.company?.id ) return;

    // Usar los valores editados
    const totalEmissions = year.editEmissions ?? 0;
    const totalCompensations = year.editCompensations ?? 0;

    // Calcular neto local
    year.net = totalEmissions - totalCompensations;

    // DTO
    const dto: CompanyCO2YearlyRequestDto = {
      year: year.year,
      totalEmissions: totalEmissions,
      totalCompensations: totalCompensations
    };

    this.companyCo2Service.save( this.user.company.id, dto ).subscribe( {
      next: ( res ) => {
        year.editMode = false;

        // Actualizar id si es nuevo
        if ( !year.id ) year.id = res.id;

        // 🔹 Actualizar los valores principales para que los charts los usen
        year.emissions = totalEmissions;        // 🔹 aquí
        year.compensations = totalCompensations; // 🔹 aquí
        year.totalEmissions = totalEmissions;
        year.totalCompensations = totalCompensations;

        // 🔹 Redibujar los charts con los valores actualizados
        this.renderCO2Charts();
      },
      error: ( err ) => console.error( 'Error guardando CO₂', err )
    } );
  }



  // Añadir un nuevo año
  addNewYear () {
    const nextYear = Math.max( ...this.co2Years.map( y => y.year ) ) + 1;
    const newYear = {
      year: nextYear,
      totalEmissions: 0,
      totalCompensations: 0,
      net: 0,
      emitidoRef: `emitido-${nextYear}`,
      compensadoRef: `compensado-${nextYear}`,
      netoRef: `neto-${nextYear}`,
      editMode: true
    };
    this.co2Years.push( newYear );
    setTimeout( () => this.renderCO2Charts(), 0 );
  }

  // Función para redibujar todos los gráficos
  renderCO2Charts () {
    this.co2Years.forEach( ( y, i ) => {
      ( ['emitidoRef', 'compensadoRef', 'netoRef'] as const ).forEach( key => {
        const canvasEl = document.getElementById( y[key] ) as HTMLCanvasElement;
        if ( !canvasEl ) return;

        // Ajustamos el tamaño
        canvasEl.width = i === 0 ? 200 : 80;
        canvasEl.height = i === 0 ? 200 : 80;

        const value =
          key === 'emitidoRef' ? y.emissions :
            key === 'compensadoRef' ? y.compensations :
              y.net;

        const color =
          key === 'emitidoRef' ? '#fc4d03ff' :
            key === 'compensadoRef' ? '#89de8cff' :
              '#2c80c5cf';

        this.createDonutChart( canvasEl, value, color, y.emissions || y.totalEmissions || 0 );
      } );
    } );
  }

  getNetColorClass ( totalEmissions: number, totalCompensations: number ): string {
    const net = totalEmissions - totalCompensations;

    // Evitamos dividir por 0
    const ratio = totalEmissions > 0 ? net / totalEmissions : 1;

    if ( ratio < 0.5 ) return 'net-yellow';       // menos del 50%
    if ( ratio <= 1 ) return 'net-red';     // entre 50% y 100%
    return 'net-green';                       // más del 100% o 0 emisiones
  }

  getCompensatedPercentage ( totalEmissions: number, totalCompensations: number ): string {
    if ( !totalEmissions || totalEmissions === 0 ) return '0';
    const percent = ( totalCompensations / totalEmissions ) * 100;
    return percent.toFixed( 0 ); // redondea a entero
  }

}
