import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthResponseDto } from '../api/model/authResponse';
import { RegisterUserRequestDto } from '../api/model/registerUserRequest';
import { UserResponseDto } from '../api/model/userResponse';
import { ResetPasswordRequestDto } from '../api/model/resetPasswordRequest';
import { AuthControllerService, MessageResponseDto } from '../api';
import { Router } from '@angular/router';

@Injectable( {
  providedIn: 'root'
} )
export class AuthService {
  private userSubject = new BehaviorSubject<UserResponseDto | null>( null );
  user$ = this.userSubject.asObservable();

  constructor ( private authApi: AuthControllerService, private router: Router ) {
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
    this.router.navigate( ['/login'] );
  }

  /** Obtener usuario actual */
  getUser (): UserResponseDto | null {
    return this.userSubject.value;
  }

  /** Guardar usuario en localStorage y BehaviorSubject */
  private setUser ( user: any, token?: string ): void {
    let parsedUser: UserResponseDto;

    if ( user instanceof Blob ) {
      // ⚙️ Si llega como Blob, lo convertimos a JSON antes de continuar
      user.text().then( text => {
        try {
          parsedUser = JSON.parse( text ) as UserResponseDto;
          this.applyUser( parsedUser, token );
        } catch ( e ) {
          console.error( '❌ Error al parsear usuario desde Blob:', e );
        }
      } );
    } else {
      parsedUser = user as UserResponseDto;
      this.applyUser( parsedUser, token );
    }
  }

  private applyUser ( user: UserResponseDto, token?: string ): void {
    this.userSubject.next( user );
    localStorage.setItem( 'forestPlus_user', JSON.stringify( user ) );
    if ( token ) {
      localStorage.setItem( 'forestPlus_token', token );
    }
  }

  /** Login con email/usuario + password */
  login ( dto: RegisterUserRequestDto ): Observable<UserResponseDto> {
    return this.authApi.login( dto ).pipe(
      switchMap( ( resp: AuthResponseDto ) => {
        if ( !resp.user ) throw new Error( 'No se recibió el usuario en la respuesta del login' );

        // Convertimos Blob a JSON si hace falta y esperamos
        if ( resp.user instanceof Blob ) {
          return from( resp.user.text() ).pipe(
            map( text => JSON.parse( text ) as UserResponseDto ),
            tap( parsedUser => this.setUser( parsedUser, resp.token ) )
          );
        } else {
          this.setUser( resp.user, resp.token );
          return of( resp.user );
        }
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
    const currentToken = localStorage.getItem( 'forestPlus_token' ); // mantenemos el token
    this.setUser( user, currentToken ?? undefined );
  }

  resendVerification ( email: string ): Observable<MessageResponseDto> {
    return this.authApi.resendVerification( { email } );
  }

  /** Reset de contraseña por UUID (forgot-password/reset) */
  resetForgotPassword ( uuid: string, payload: ResetPasswordRequestDto ): Observable<MessageResponseDto> {
    return this.authApi.resetForgotPassword( uuid, payload );
  }

  /** Renovar el token usando el refresh token */
  refreshToken (): Observable<AuthResponseDto> {
    const refreshToken = localStorage.getItem( 'forestPlus_refresh_token' );
    if ( !refreshToken ) {
      // No hay refresh token, forzar logout
      this.logout();
      return throwError( () => new Error( 'No refresh token found' ) );
    }

    return this.authApi.refreshToken( { refreshToken } ).pipe(
      map( ( resp: AuthResponseDto ) => {
        if ( !resp.user || !resp.token ) {
          throw new Error( 'Refresh failed: no token/user received' );
        }
        // Actualizamos usuario y token en localStorage
        this.setUser( resp.user, resp.token );
        if ( resp.refreshToken ) {
          localStorage.setItem( 'forestPlus_refresh_token', resp.refreshToken );
        }
        return resp;
      } ),
      catchError( err => {
        // Si el refresh falla, cerramos sesión
        this.logout();
        return throwError( () => err );
      } )
    );
  }
  /** Obtener rol del usuario actual */
  get currentUserRole (): UserResponseDto.RoleEnum | null {
    return this.userSubject.value?.role ?? null;
  }

  /** Obtener el ID de la compañía del usuario actual */
  get currentUserCompanyId (): number | null {
    const user = this.userSubject.value;
    return user?.company?.id ?? null; // accede a company.id si existe, sino null
  }

}
