import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardControllerService } from '../api';
import { HomeDashboardKpiResponseDto } from '../api/model/homeDashboardKpiResponse';

@Injectable( {
  providedIn: 'root'
} )
export class DashboardService {
  private homeKpisSubject = new BehaviorSubject<HomeDashboardKpiResponseDto | null>( null );

  constructor ( private dashboardController: DashboardControllerService ) { }

  /** 🔹 Observable para suscribirse a los KPIs de la home */
  getHomeKpis (): Observable<HomeDashboardKpiResponseDto | null> {
    return this.homeKpisSubject.asObservable();
  }

  /** 🔹 Valor actual de los KPIs */
  getCurrentHomeKpis (): HomeDashboardKpiResponseDto | null {
    return this.homeKpisSubject.value;
  }

  /** 🔹 Cargar KPIs desde el backend */
  loadHomeKpis (): Observable<HomeDashboardKpiResponseDto> {
    return this.dashboardController.getHomeKpis().pipe(
      map( kpis => {
        this.homeKpisSubject.next( kpis );
        return kpis;
      } )
    );
  }

  /** 🔹 Limpiar KPIs */
  clearHomeKpis () {
    this.homeKpisSubject.next( null );
  }
}