import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { UserResponseDto } from '../../api';
import { AuthService } from '../../services/auth.service';

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
  @Input() user?: UserResponseDto;

  constructor (
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit (): void {
    // Escuchamos el usuario logueado
    this.authService.user$.subscribe( user => {
      this.user = user ?? undefined;
    } );
  }

  goToEdit (): void {
    console.log( 'this.user?.id', this.user?.id );
    if ( this.user?.id ) {
      this.router.navigate( [`/admin/user-form/${this.user.id}`] );
    }
  }
}
