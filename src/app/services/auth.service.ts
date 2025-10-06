import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthResponseDto } from '../api/model/authResponse';
import { RegisterUserRequestDto } from '../api/model/registerUserRequest';
import { UserResponseDto } from '../api/model/userResponse';
import { ResetPasswordRequestDto } from '../api/model/resetPasswordRequest';
import { AuthControllerService, MessageResponseDto } from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class AuthService {
  private userSubject = new BehaviorSubject<UserResponseDto | null>( null );
  user$ = this.userSubject.asObservable();

  constructor ( private authApi: AuthControllerService ) {
    // Cargar usuario desde localStorage si existe
    const storedUser = localStorage.getItem( 'forestPlus_user' );
    if ( storedUser ) {
      this.userSubject.next( JSON.parse( storedUser ) );
    }
  }

  /** Saber si hay sesión activa */
  isLoggedIn (): boolean {
    return this.userSubject.value !== null;
  }

  /** Cerrar sesión */
  logout (): void {
    localStorage.removeItem( 'forestPlus_token' );
    localStorage.removeItem( 'forestPlus_user' );
    this.userSubject.next( null );
  }

  /** Obtener usuario actual */
  getUser (): UserResponseDto | null {
    return this.userSubject.value;
  }

  /** Guardar usuario en localStorage y BehaviorSubject */
  private setUser ( user: UserResponseDto, token?: string ): void {
    this.userSubject.next( user );
    localStorage.setItem( 'forestPlus_user', JSON.stringify( user ) );
    if ( token ) {
      localStorage.setItem( 'forestPlus_token', token );
    }
  }

  /** Login con email/usuario + password */
  login ( registerUserRequestDto: RegisterUserRequestDto ): Observable<UserResponseDto> {
    return this.authApi.login( registerUserRequestDto ).pipe(
      map( ( resp: AuthResponseDto ) => {
        if ( !resp.user ) {
          throw new Error( 'No se recibió el usuario en la respuesta del login' );
        }
        this.setUser( resp.user, resp.token );
        return resp.user;
      } ),
      catchError( err => {
        console.error( 'Error login', err );
        return throwError( () => err );
      } )
    );
  }

  /** Registro de usuario */
  register ( registerUserRequestDto: RegisterUserRequestDto ): Observable<UserResponseDto> {
    return this.authApi.register( registerUserRequestDto ).pipe(
      map( user => {
        const typedUser = user as UserResponseDto;
        if ( !typedUser ) {
          throw new Error( 'No se recibió el usuario tras el registro' );
        }
        this.setUser( typedUser );
        return typedUser;
      } ),
      catchError( err => throwError( () => err ) )
    );
  }

  /** Solicitar recuperación de contraseña */
  forgotPassword ( email: string ): Observable<any> {
    return this.authApi.forgotPassword( { email } ).pipe(
      catchError( err => throwError( () => err ) )
    );
  }

  /** Restablecer contraseña con token */
  resetPassword ( payload: ResetPasswordRequestDto, uuid?: string ): Observable<MessageResponseDto> {
    if ( uuid ) {
      // reset por UUID (forgot-password/reset)
      return this.authApi.resetForgotPassword( uuid, payload );
    }

    // reset para usuario logueado
    const token = localStorage.getItem( 'forestPlus_token' );
    if ( !token ) throw new Error( 'No hay token de usuario logueado' );
    const authHeader = `Bearer ${token}`;
    return this.authApi.resetPassword( authHeader, payload );
  }

  /** Verificar email con UUID */
  verifyEmail ( uuid: string ): Observable<any> {
    return this.authApi.verifyEmail( uuid ).pipe(
      catchError( err => throwError( () => err ) )
    );
  }

  public updateCurrentUser ( user: UserResponseDto ): void {
    this.setUser( user );
  }

  resendVerification ( email: string ): Observable<MessageResponseDto> {
    return this.authApi.resendVerification( { email } );
  }

  /** Reset de contraseña por UUID (forgot-password/reset) */
  resetForgotPassword ( uuid: string, payload: ResetPasswordRequestDto ): Observable<MessageResponseDto> {
    return this.authApi.resetForgotPassword( uuid, payload );
  }

}
