import { Injectable } from '@angular/core';

@Injectable( {
  providedIn: 'root'
} )
export class AuthService {
  private user: any = null; // aquí guardamos el usuario (puede venir del localStorage)

  constructor () {
    // ejemplo: cargar usuario del localStorage
    const storedUser = localStorage.getItem( 'user' );
    if ( storedUser ) {
      this.user = JSON.parse( storedUser );
    }
  }

  isLoggedIn (): boolean {
    return this.user !== null;
  }

  login ( userData: any ) {
    this.user = userData;
    localStorage.setItem( 'user', JSON.stringify( userData ) );
  }

  logout () {
    this.user = null;
    localStorage.removeItem( 'user' );
  }

  getUser () {
    return this.user;
  }
}
