import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { DashboardService } from '../../services/dashboard.service';
import { UserResponseDto, HomeDashboardKpiResponseDto } from '../../api';
import { filter, take } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component( {
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
} )
export class HomeComponent implements OnInit {
  userName: string = '';
  isAdmin = false;
  homeKpis?: HomeDashboardKpiResponseDto;

  constructor (
    private userService: UserService,
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  checkRole () {
    const role = this.authService.currentUserRole;
    this.isAdmin = role === 'ADMIN';
  }

  ngOnInit (): void {
    // Suscribimos al usuario actual solo cuando está definido
    this.userService.user$.pipe(
      filter( ( user ): user is UserResponseDto => user !== null ),
      take( 1 )
    ).subscribe( user => {
      this.userName = user.name;
      this.checkRole();
      this.dashboardService.loadHomeKpis().subscribe( kpis => {
        this.homeKpis = kpis;
      } );
    } );
  }
}
