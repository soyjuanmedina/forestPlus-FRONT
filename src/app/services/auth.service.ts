import { Injectable } from '@angular/core';
import { UserResponseDto } from '../api/model/userResponse';

@Injectable( {
  providedIn: 'root'
} )
export class AuthService {
  private user: UserResponseDto | null = null;

  constructor () {
    const storedUser = localStorage.getItem( 'forestPlus_user' );
    if ( storedUser ) {
      this.user = JSON.parse( storedUser );
    }
  }

  /** ✅ Saber si hay sesión activa */
  isLoggedIn (): boolean {
    return this.user !== null;
  }

  /** ✅ Cerrar sesión */
  logout (): void {
    localStorage.removeItem( 'forestPlus_token' );
    localStorage.removeItem( 'forestPlus_user' );
    this.user = null;
  }

  /** ✅ Obtener usuario logueado */
  getUser (): UserResponseDto | null {
    return this.user;
  }

  /** ✅ Guardar usuario en localStorage (por ejemplo, después de login) */
  setUser ( user: UserResponseDto ): void {
    this.user = user;
    localStorage.setItem( 'forestPlus_user', JSON.stringify( user ) );
  }
}
