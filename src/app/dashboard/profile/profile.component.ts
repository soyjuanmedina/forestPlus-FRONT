import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

import { LandTreeSummaryResponseDto, UserResponseDto } from '../../api';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { TreeService } from '../../services/tree.service';
import { Subject, takeUntil } from 'rxjs';

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
export class ProfileComponent implements OnInit, OnDestroy {
  user?: UserResponseDto;
  plantedTrees: LandTreeSummaryResponseDto[] = [];
  isAdmin = false;
  private destroy$ = new Subject<void>();

  constructor (
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private treeService: TreeService,

  ) { }

  ngOnInit (): void {
    // Intentamos obtener el id desde la ruta
    const id = this.route.snapshot.paramMap.get( 'id' );

    if ( id ) {
      // Si hay un id en la ruta, cargamos ese usuario
      this.userService.getUserById( +id ).subscribe( {
        next: user => {
          this.user = user;
          this.checkRole();
          this.loadUserTrees( user.id );
        },
        error: ( err ) => {
          console.error( 'Error al cargar usuario por id', err );
          // fallback: redirigir o mostrar mensaje
        }
      } );
    } else {
      // Si no hay id, usamos el usuario actual logueado
      this.authService.user$.pipe( takeUntil( this.destroy$ ) ).subscribe( user => {
        if ( user ) {
          this.user = user;
          this.checkRole();
          this.loadUserTrees( user.id );
        }
      } );
    }
  }

  goToEdit (): void {
    if ( this.user?.id ) {
      this.router.navigate( [`profile/edit/${this.user.id}`] );
    }
  }

  loadUserTrees ( userId: number ) {
    this.treeService.getTreesByOwner( userId ).subscribe( {
      next: trees => this.plantedTrees = trees,
      error: err => console.error( 'Error al cargar árboles', err )
    } );
  }

  checkRole () {
    const role = this.authService.currentUserRole;
    this.isAdmin = role === 'ADMIN';
  }



  ngOnDestroy (): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
