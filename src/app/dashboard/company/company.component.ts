import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { UserService } from '../../services/user.service';
import { CompanyService } from '../../services/company.service';

@Component( {
  selector: 'app-company',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
} )
export class CompanyComponent implements OnInit {
  user: any;
  editMode = false;
  editData: any = {};

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

  saveChanges (): void {
    if ( !this.user?.company?.id ) return;

    const updateDto = {
      name: this.editData.name,
      address: this.editData.address
    };

    // 🔹 Llamada al backend para actualizar la compañía
    this.companyService.updateCompany( this.user.company.id, updateDto ).subscribe( {
      next: updatedCompany => {
        if ( this.user ) {
          this.user.company = updatedCompany;
          this.userService.updateCurrentUser( this.user ); // actualizar BehaviorSubject
        }
        this.editMode = false;
      },
      error: err => {
        console.error( '❌ Error al actualizar compañía:', err );
      }
    } );
  }
}
