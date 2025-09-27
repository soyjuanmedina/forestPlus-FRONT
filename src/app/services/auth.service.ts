import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { LoginResponse } from '../models/login.response';
import { UserResponse } from '../models/user.response';
import { RegisterUserRequest } from '../models/register.request ';
import { ResendVerificationEmailRequest } from '../models/resend-verification-request';



@Injectable( {
  providedIn: 'root'
} )
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/auth`;
  private user: any = null; // aquí guardamos el usuario (puede venir del localStorage)

  constructor ( private http: HttpClient, private userService: UserService ) {
    // ejemplo: cargar usuario del localStorage
    const storedUser = localStorage.getItem( 'forestPlus_user' );
    if ( storedUser ) {
      this.user = JSON.parse( storedUser );
    }
  }

  isLoggedIn (): boolean {
    return this.user !== null;
  }

  register ( request: RegisterUserRequest ): Observable<UserResponse> {
    return this.http.post<UserResponse>( `${this.baseUrl}/register`, request );
  }

  resendVerificationEmail ( request: ResendVerificationEmailRequest ): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/resend-verification`,
      request
    );
  }

  resetPassword ( payload: { newPassword: string } ): Observable<any> {
    const token = localStorage.getItem( 'forestPlus_token' );
    return this.http.post( `${this.baseUrl}/reset-password`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    } );
  }

  forgotPassword ( email: string ): Observable<any> {
    return this.http.post( `${this.baseUrl}/forgot-password`, { email } );
  }

  resetForgotPassword ( uuid: string, newPassword: string ): Observable<any> {
    return this.http.post( `${this.baseUrl}/forgot-password/reset?uuid=${uuid}`, {
      newPassword
    } );
  }

  login ( credentials: { email: string; password: string } ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>( `${this.baseUrl}/login`, credentials ).pipe(
      tap( res => {
        localStorage.setItem( 'forestPlus_token', res.token );
        this.user = res.user;
        localStorage.setItem( 'forestPlus_user', JSON.stringify( this.user ) );
        this.userService.setUser( this.user )
      } )
    );
  }

  logout () {
    localStorage.removeItem( 'forestPlus_token' );
    localStorage.removeItem( 'forestPlus_user' );
  }

  verifyEmail ( uuid: string ): Observable<any> {
    return this.http.get( `${this.baseUrl}/verify?uuid=${uuid}` );
  }

  getUser () {
    return this.user;
  }
}
