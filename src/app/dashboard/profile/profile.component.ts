import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

import { UserResponseDto } from '../../api';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component( {
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
} )
export class ProfileComponent implements OnInit {
  user?: UserResponseDto;

  constructor (
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit (): void {
    // Intentamos obtener el id desde la ruta
    const id = this.route.snapshot.paramMap.get( 'id' );

    if ( id ) {
      // Si hay un id en la ruta, cargamos ese usuario
      this.userService.getUserById( +id ).subscribe( {
        next: ( user ) => this.user = user,
        error: ( err ) => {
          console.error( 'Error al cargar usuario por id', err );
          // fallback: redirigir o mostrar mensaje
        }
      } );
    } else {
      // Si no hay id, usamos el usuario actual logueado
      this.authService.user$.subscribe( user => {
        this.user = user ?? undefined;
      } );
    }
  }

  goToEdit (): void {
    if ( this.user?.id ) {
      this.router.navigate( [`profile/edit/${this.user.id}`] );
    }
  }
}
