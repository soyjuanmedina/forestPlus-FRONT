import { Component, OnInit } from '@angular/core';
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
import { BaseChartDirective } from 'ng2-charts';
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
    MatIconModule,
    BaseChartDirective
  ],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
} )
export class CompanyComponent implements OnInit {
  user: any;
  editMode = false;
  editData: any = {};
  selectedFile?: File;
  previewImage?: string;

  lastCO2Year?: any;
  totalCO2?: number;

  emitidoData = [10, 90];      // [valor, resto]
  emitidoLabels = ['Emitido', 'Resto'];
  emitidoType = 'doughnut';

  compensadoData = [5, 95];
  compensadoLabels = ['Compensado', 'Resto'];
  compensadoType = 'doughnut';

  netoData = [3, 97];
  netoLabels = ['Neto', 'Resto'];
  netoType = 'doughnut';

  constructor (
    private userService: UserService,
    private companyService: CompanyService
  ) { }

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

  toggleEdit (): void {
    if ( this.user?.company ) {
      this.editData = { ...this.user.company };
    }
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

  private updateLastCO2Year () {
    if ( !this.user?.company?.co2?.length ) {
      this.lastCO2Year = undefined;
      this.totalCO2 = undefined;
      return;
    }

    const sorted = [...this.user.company.co2].sort( ( a, b ) => b.year - a.year );
    this.lastCO2Year = sorted[0];
    const emitted = this.lastCO2Year.emissions?.total || 0;
    const compensated = this.lastCO2Year.compensations?.total || 0;
    this.totalCO2 = emitted - compensated;
  }

}
