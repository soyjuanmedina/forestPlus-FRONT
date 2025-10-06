import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UserResponseDto, RegisterUserRequestDto } from '../../api';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component( {
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
} )
export class ProfileComponent implements OnInit {
  @Input() user?: UserResponseDto;

  editMode = false;
  editData: RegisterUserRequestDto = {};

  constructor (
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit (): void {
    this.userService.getUser().subscribe( u => {
      this.user = u ?? undefined;
      console.log( 'ngOnInit', this.user );
    } );
  }

  toggleEdit (): void {
    if ( this.user ) {
      this.editData = { ...this.user }; // Clonamos los datos actuales
    }
    this.editMode = !this.editMode;
  }

  saveChanges (): void {
    if ( !this.user?.id ) return;

    // 🔹 Creamos el DTO que realmente espera el backend
    const updateDto: RegisterUserRequestDto = {
      name: this.editData.name,
      surname: this.editData.surname,
      secondSurname: this.editData.secondSurname,
      email: this.editData.email
    };

    this.userService.updateUser( this.user.id, updateDto ).subscribe( {
      next: ( updated: UserResponseDto ) => {
        this.user = updated;
        this.editMode = false;
        this.authService.updateCurrentUser( updated );
      },
      error: err => {
        console.error( '❌ Error al actualizar usuario:', err );
      }
    } );
  }
}
