import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

import { UserResponseDto, RegisterUserRequestDto } from '../../api';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
} )
export class ProfileComponent implements OnInit {
  @Input() user?: UserResponseDto;

  editMode = false;
  editData: RegisterUserRequestDto = {};
  selectedFile?: File;
  previewImage?: string;

  constructor (
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit (): void {
    this.authService.user$.subscribe( user => {
      this.user = user ?? undefined;
    } );
  }

  toggleEdit (): void {
    if ( this.user ) {
      this.editData = { ...this.user }; // Clonamos los datos actuales
    }
    this.editMode = !this.editMode;
  }

  onFileSelected ( event: any ): void {
    const file: File = event.target.files[0];
    if ( file ) {
      this.selectedFile = file;

      // Mostrar preview
      const reader = new FileReader();
      reader.onload = e => this.previewImage = reader.result as string;
      reader.readAsDataURL( file );
    }
  }

  saveChanges (): void {
    if ( !this.user?.id ) return;

    const updateDto: RegisterUserRequestDto = {
      ...this.editData,
      role: this.user.role,
      email: this.user.email
    };

    // Creamos un array de observables dependiendo de lo que hay que actualizar
    const requests = [];

    if ( this.selectedFile ) {
      requests.push(
        this.userService.updateUserPicture( this.user.id, this.selectedFile )
          .pipe( catchError( err => { console.error( 'Error al subir imagen', err ); return of( this.user! ); } ) )
      );
    }

    if ( updateDto.name || updateDto.surname || updateDto.secondSurname || updateDto.email ) {
      requests.push(
        this.userService.updateUser( this.user.id, updateDto )
          .pipe( catchError( err => { console.error( 'Error al actualizar datos', err ); return of( this.user! ); } ) )
      );
    }

    if ( requests.length === 0 ) {
      this.editMode = false;
      return;
    }

    forkJoin( requests ).subscribe( results => {
      // Tomamos el último resultado como el usuario actualizado
      const updatedUser = results[results.length - 1] as UserResponseDto;
      this.finalizeUpdate( updatedUser );
    } );
  }

  private finalizeUpdate ( user: UserResponseDto ) {
    this.user = user;
    this.authService.updateCurrentUser( user );
    this.editMode = false;
    this.selectedFile = undefined;
    this.previewImage = undefined;
  }
}
