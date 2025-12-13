import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

import { PlannedPlantationResponseDto } from '../../api/model/plannedPlantationResponse';
import { PlannedPlantationService } from '../../services/planned-plantation.service';
import { UserService } from '../../services/user.service';
import { UserResponseDto } from '../../api/model/userResponse';
import { RolesEnum } from '../../models/roles';

@Component( {
  selector: 'app-planned-plantation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './planned-plantation.component.html',
  styleUrls: ['./planned-plantation.component.scss']
} )
export class PlannedPlantationComponent implements OnInit {

  plannedPlantation!: PlannedPlantationResponseDto;
  user: UserResponseDto | null = null;
  isEditable = false;

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private plannedPlantationService: PlannedPlantationService,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) { }

  ngOnInit (): void {
    const id = this.route.snapshot.paramMap.get( 'id' );
    this.user = this.userService.getCurrentUser();

    if ( id ) {
      this.plannedPlantationService.getById( +id ).subscribe( {
        next: ( pp ) => {
          this.plannedPlantation = pp;
          this.isEditable =
            this.user?.role === RolesEnum.ADMIN ||
            this.user?.role === RolesEnum.COMPANY_ADMIN;
        },
        error: ( err ) => {
          console.error( '❌ Error al cargar la plantación prevista', err );
          this.snackBar.open(
            'Error al cargar la plantación prevista',
            'Cerrar',
            { duration: 3000 }
          );
        }
      } );
    }
  }

  goToEditForm (): void {
    if ( this.plannedPlantation?.id ) {
      this.router.navigate( [
        '/admin/planned-plantation-form',
        this.plannedPlantation.id
      ] );
    }
  }
}
