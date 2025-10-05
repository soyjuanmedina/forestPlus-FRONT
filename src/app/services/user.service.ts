import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserResponseDto } from '../api/model/userResponse';


@Injectable( { providedIn: 'root' } )
export class UserService {
  private userSubject = new BehaviorSubject<UserResponseDto | null>( null );

  constructor () {
    const savedUser = localStorage.getItem( 'user' );
    if ( savedUser ) {
      this.userSubject.next( JSON.parse( savedUser ) );
    }
  }

  setUser ( user: UserResponseDto ) {
    this.userSubject.next( user );
    localStorage.setItem( 'user', JSON.stringify( user ) );
  }

  getUser (): Observable<UserResponseDto | null> {
    return this.userSubject.asObservable();
  }

  getCurrentUser (): UserResponseDto | null {
    return this.userSubject.value;
  }

  clearUser () {
    this.userSubject.next( null );
    localStorage.removeItem( 'user' );
  }
}
