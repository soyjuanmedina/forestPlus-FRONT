import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { DashboardService } from '../../services/dashboard.service';
import { UserResponseDto, HomeDashboardKpiResponseDto } from '../../api';
import { filter, take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component( {
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
} )
export class HomeComponent implements OnInit {
  userName: string = '';
  isAdmin = false;
  isPreLaunch = true;
  homeKpis?: HomeDashboardKpiResponseDto;

  carKm!: number;
  planeKm !: number;
  homes!: number;
  CO2_EQUIVALENCES = {
    CAR_KG_PER_KM: 0.12,
    PLANE_KG_PER_KM: 0.10,
    HOME_YEAR_KG: 1800
  };

  constructor (
    private userService: UserService,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router,
  ) { }

  checkRole () {
    const role = this.authService.currentUserRole;
    this.isAdmin = role === 'ADMIN';
  }

  calculateEquivalences (): void {
    const annualCo2 = this.homeKpis?.annualCo2Compensated ?? 0;

    this.carKm = Math.round(
      annualCo2 / this.CO2_EQUIVALENCES.CAR_KG_PER_KM
    );

    this.planeKm = Math.round(
      annualCo2 / this.CO2_EQUIVALENCES.PLANE_KG_PER_KM
    );

    this.homes = +(
      annualCo2 / this.CO2_EQUIVALENCES.HOME_YEAR_KG
    ).toFixed( 1 );
  }

  buyNewTree () {
    this.router.navigate( ['/buy-tree'] );
  }

  ngOnInit (): void {
    if ( this.isPreLaunch ) {
      this.homeKpis = {
        plantedTrees: 500,
        pendingTreesCount: 0,
        annualCo2Compensated: 2500
      }
      this.calculateEquivalences();
    } else {
      // Suscribimos al usuario actual solo cuando está definido
      this.userService.user$.pipe(
        filter( ( user ): user is UserResponseDto => user !== null ),
        take( 1 )
      ).subscribe( user => {
        this.userName = user.name;
        this.checkRole();
        this.dashboardService.loadHomeKpis().subscribe( kpis => {
          this.homeKpis = kpis;
          this.calculateEquivalences();
        } );
      } );
    }
  }


}
