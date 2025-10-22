import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { catchError, forkJoin, of } from 'rxjs';
import { CompanyResponseDto, CompanyCO2YearlyRequestDto, UserResponseDto } from '../../../../../api';
import { CompanyService } from '../../../../../services/company.service';
import { CompanyCo2Service } from '../../../../../services/company-co2.service';
import { Chart, ChartConfiguration, Plugin, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { UserService } from '../../../../../services/user.service';

interface LocalCO2Year {
  year: number;
  totalEmissions: number;
  totalCompensations: number;
  net: number;
  emitidoRef: string;
  compensadoRef: string;
  netoRef: string;
  editMode: boolean;
  editEmissions: number;
  editCompensations: number;
  id?: number;
}

@Component( {
  selector: 'app-company-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './company-form.component.html',
} )
export class CompanyFormComponent implements OnInit {
  company!: CompanyResponseDto;
  editData: any = {};
  selectedFile?: File;
  previewImage?: string;

  co2Years: LocalCO2Year[] = [];
  chartsMap: { [key: string]: Chart } = {};
  availableYears: number[] = [];
  selectedYear?: number;
  user?: UserResponseDto | null;

  constructor (
    private companyService: CompanyService,
    private companyCo2Service: CompanyCo2Service,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    Chart.register( DoughnutController, ArcElement, Tooltip, Legend );
  }

  ngOnInit () {
    const id = Number( this.route.snapshot.paramMap.get( 'id' ) );
    if ( !id ) return;

    // Obtenemos el usuario para saber su rol
    this.userService.getUser().subscribe( user => {
      this.user = user;
    } );

    this.companyService.getCompanyById( id ).subscribe( c => {
      this.company = c;
      this.editData = { ...c };
      this.prepareCO2Years();
      this.updateAvailableYears();
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

  saveChanges () {
    if ( !this.company?.id ) return;
    const requests = [];

    if ( this.selectedFile ) {
      requests.push(
        this.companyService.updateCompanyPicture( this.company.id, this.selectedFile )
          .pipe( catchError( err => { console.error( err ); return of( this.company ); } ) )
      );
    }

    if ( this.editData.name || this.editData.address ) {
      requests.push(
        this.companyService.updateCompany( this.company.id, {
          name: this.editData.name,
          address: this.editData.address
        } ).pipe( catchError( err => { console.error( err ); return of( this.company ); } ) )
      );
    }

    if ( !requests.length ) return;

    forkJoin( requests ).subscribe( results => {
      const updatedCompany = results[results.length - 1];
      this.company = updatedCompany;
      this.editData = { ...updatedCompany };
      this.selectedFile = undefined;
      this.previewImage = undefined;
      this.prepareCO2Years();
      this.updateAvailableYears();
    } );
  }

  // -----------------------
  // CO2
  // -----------------------
  private prepareCO2Years () {
    if ( !this.company?.co2?.length ) return;

    const sorted = [...this.company.co2]
      .filter( y => y.year !== undefined )
      .sort( ( a, b ) => b.year! - a.year! );

    this.co2Years = sorted.map( y => ( {
      id: y.id,
      year: y.year!,
      totalEmissions: y.totalEmissions || 0,
      totalCompensations: y.totalCompensations || 0,
      net: ( y.totalEmissions || 0 ) - ( y.totalCompensations || 0 ),
      emitidoRef: `emitido-${y.year}`,
      compensadoRef: `compensado-${y.year}`,
      netoRef: `neto-${y.year}`,
      editMode: false,
      editEmissions: y.totalEmissions || 0,
      editCompensations: y.totalCompensations || 0
    } ) );

    setTimeout( () => this.renderCO2Charts(), 0 );
  }

  toggleEditCO2 ( y: LocalCO2Year ) {
    if ( !y.editMode ) {
      ( y as any )._backup = { emissions: y.totalEmissions, compensations: y.totalCompensations };
    } else if ( ( y as any )._backup ) {
      y.totalEmissions = ( y as any )._backup.emissions;
      y.totalCompensations = ( y as any )._backup.compensations;
    }
    y.editMode = !y.editMode;
    setTimeout( () => this.renderCO2Charts(), 0 );
  }

  saveCO2 ( y: LocalCO2Year ) {
    if ( !this.company?.id ) return;

    const totalEmissions = y.editEmissions ?? 0;
    const totalCompensations = y.editCompensations ?? 0;
    y.net = totalEmissions - totalCompensations;

    const dto: CompanyCO2YearlyRequestDto = {
      year: y.year,
      totalEmissions,
      totalCompensations
    };

    this.companyCo2Service.save( this.company.id, dto ).subscribe( {
      next: res => {
        y.id = res.id;
        y.totalEmissions = totalEmissions;
        y.totalCompensations = totalCompensations;
        y.editMode = false;
        this.renderCO2Charts();
        this.updateAvailableYears();
      },
      error: err => console.error( 'Error guardando CO₂', err )
    } );
  }

  addNewYear ( year?: number ) {
    if ( !year || !this.company?.id ) return;

    const newYear: LocalCO2Year = {
      year,
      totalEmissions: 0,
      totalCompensations: 0,
      net: 0,
      emitidoRef: `emitido-${year}`,
      compensadoRef: `compensado-${year}`,
      netoRef: `neto-${year}`,
      editMode: true,
      editEmissions: 0,
      editCompensations: 0
    };

    const dto: CompanyCO2YearlyRequestDto = {
      year,
      totalEmissions: 0,
      totalCompensations: 0
    };

    this.companyCo2Service.save( this.company.id, dto ).subscribe( {
      next: res => {
        newYear.id = res.id;
        this.co2Years.push( newYear );
        this.co2Years.sort( ( a, b ) => b.year - a.year );
        this.selectedYear = undefined;
        this.updateAvailableYears();
        setTimeout( () => this.renderCO2Charts(), 0 );
      },
      error: err => console.error( 'Error guardando nuevo año CO₂', err )
    } );
  }

  private createDonutChart ( canvas: HTMLCanvasElement, value: number, color: string, totalEmissions: number ) {
    const ctx = canvas.getContext( '2d' );
    if ( !ctx ) return;

    if ( this.chartsMap[canvas.id] ) this.chartsMap[canvas.id].destroy();

    const centerTextPlugin: Plugin<'doughnut', any> = {
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

    const base = totalEmissions > 0 ? totalEmissions : 1;
    const percent = ( value / base ) * 100;
    const data = { datasets: [{ data: [percent, 100 - percent], backgroundColor: [color, '#e0e0e0'], cutout: '75%', borderWidth: 0 }] };
    const options: ChartConfiguration<'doughnut'>['options'] = { responsive: true, animation: { animateRotate: true, animateScale: true, duration: 1000 }, plugins: { legend: { display: false }, tooltip: { enabled: false } } };

    this.chartsMap[canvas.id] = new Chart( ctx, { type: 'doughnut', data, options, plugins: [centerTextPlugin] } );
  }


  renderCO2Charts () {
    type CO2ChartKey = 'emitidoRef' | 'compensadoRef' | 'netoRef';
    const chartKeys: CO2ChartKey[] = ['emitidoRef', 'compensadoRef', 'netoRef'];

    this.co2Years.forEach( ( y, i ) => {
      const size = i === 0 ? 200 : 80;

      chartKeys.forEach( ( key ) => {
        const canvasEl = document.getElementById( y[key] ) as HTMLCanvasElement | null;
        if ( !canvasEl ) return;

        canvasEl.width = size;
        canvasEl.height = size;

        const value = key === 'emitidoRef' ? y.totalEmissions
          : key === 'compensadoRef' ? y.totalCompensations
            : y.net;

        const color = key === 'emitidoRef' ? '#fc4d03ff'
          : key === 'compensadoRef' ? '#89de8cff'
            : '#2c80c5cf';

        this.createDonutChart( canvasEl, value, color, y.totalEmissions || 1 );
      } );
    } );
  }

  updateAvailableYears () {
    const currentYear = new Date().getFullYear();
    const existingYears = this.co2Years.map( y => y.year );
    this.availableYears = [];
    for ( let y = 2020; y <= currentYear; y++ ) if ( !existingYears.includes( y ) ) this.availableYears.push( y );
    this.availableYears.sort( ( a, b ) => b - a );
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

  saveCompany () {
    if ( !this.company?.id ) return;

    const requests = [];

    // ✅ Actualizar logo si se seleccionó una nueva imagen
    if ( this.selectedFile ) {
      requests.push(
        this.companyService.updateCompanyPicture( this.company.id, this.selectedFile )
          .pipe( catchError( err => {
            console.error( 'Error actualizando imagen', err );
            return of( this.company );
          } ) )
      );
    }

    // ✅ Actualizar nombre o dirección
    if ( this.editData.name !== this.company.name || this.editData.address !== this.company.address ) {
      requests.push(
        this.companyService.updateCompany( this.company.id, {
          name: this.editData.name,
          address: this.editData.address
        } ).pipe( catchError( err => {
          console.error( 'Error actualizando empresa', err );
          return of( this.company );
        } ) )
      );
    }

    // 🚫 Si no hay cambios, no hacemos nada
    if ( !requests.length ) return;

    forkJoin( requests ).subscribe( results => {
      const updatedCompany = results[results.length - 1];
      this.company = updatedCompany;
      this.editData = { ...updatedCompany };
      this.selectedFile = undefined;
      this.previewImage = undefined;
      this.prepareCO2Years();
      this.updateAvailableYears();
    } );
  }

  cancel () {
    if ( !this.user ) return;

    if ( this.user.role === 'ADMIN' ) {
      this.router.navigate( ['/admin/companies'] );
    } else if ( this.user.role === 'COMPANY_ADMIN' ) {
      this.router.navigate( ['/dashboard/company'] );
    } else {
      this.router.navigate( ['/'] ); // fallback
    }
  }

}
