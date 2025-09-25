import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserResponse } from '../models/user.response';

@Injectable( { providedIn: 'root' } )
export class UserService {
  private userSubject = new BehaviorSubject<UserResponse | null>( null );

  constructor () {
    const savedUser = localStorage.getItem( 'user' );
    if ( savedUser ) {
      this.userSubject.next( JSON.parse( savedUser ) );
    }
  }

  setUser ( user: UserResponse ) {
    this.userSubject.next( user );
    localStorage.setItem( 'user', JSON.stringify( user ) );
  }

  getUser (): Observable<UserResponse | null> {
    return this.userSubject.asObservable();
  }

  getCurrentUser (): UserResponse | null {
    return this.userSubject.value;
  }

  clearUser () {
    this.userSubject.next( null );
    localStorage.removeItem( 'user' );
  }
}
