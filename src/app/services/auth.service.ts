import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';



@Injectable( {
  providedIn: 'root'
} )
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/auth`;
  private user: any = null; // aquí guardamos el usuario (puede venir del localStorage)

  constructor ( private http: HttpClient ) {
    // ejemplo: cargar usuario del localStorage
    const storedUser = localStorage.getItem( 'forestPlus_user' );
    if ( storedUser ) {
      this.user = JSON.parse( storedUser );
    }
  }

  isLoggedIn (): boolean {
    return this.user !== null;
  }

  login ( credentials: { email: string; password: string } ): Observable<{ token: string }> {
    return this.http.post<{ token: string }>( `${this.baseUrl}/login`, credentials ).pipe(
      tap( res => {
        localStorage.setItem( 'forestPlus_token', res.token );
        this.user = { email: credentials.email };
        localStorage.setItem( 'forestPlus_user', JSON.stringify( this.user ) );
      } )
    );
  }

  logout () {
    localStorage.removeItem( 'forestPlus_token' );
    localStorage.removeItem( 'forestPlus_user' );
  }

  getUser () {
    return this.user;
  }
}
