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
export class CompanyComponent implements OnInit {
  user: any;
  editMode = false;
  editData: any = {};
  selectedFile?: File;
  previewImage?: string;

  constructor (
    private userService: UserService,
    private companyService: CompanyService
  ) { }

  ngOnInit (): void {
    this.userService.getUser().subscribe( user => {
      this.user = user;
      if ( user?.company ) {
        this.editData = { ...user.company };
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

      // Preview
      const reader = new FileReader();
      reader.onload = e => this.previewImage = reader.result as string;
      reader.readAsDataURL( file );
    }
  }

  saveChanges (): void {
    if ( !this.user?.company?.id ) return;

    const updateDto = {
      name: this.editData.name,
      address: this.editData.address
    };

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
    } );
  }

  private finalizeUpdate ( updatedCompany: any ) {
    if ( this.user ) {
      this.user.company = updatedCompany;
      this.userService.updateCurrentUser( this.user ); // actualizar BehaviorSubject
    }
    this.editMode = false;
    this.selectedFile = undefined;
    this.previewImage = undefined;
  }
}
