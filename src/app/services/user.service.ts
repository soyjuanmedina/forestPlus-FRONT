import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { UserResponseDto } from '../api/model/userResponse';
import { RegisterUserRequestDto } from '../api/model/registerUserRequest';
import { RegisterUserByAdminRequestDto } from '../api/model/registerUserByAdminRequest';
import { PageUserResponseDto, UserControllerService } from '../api';
import { RolesEnum } from '../models/roles';

@Injectable( {
  providedIn: 'root'
} )
export class UserService {
  private userSubject = new BehaviorSubject<UserResponseDto | null>( null );

  constructor ( private userController: UserControllerService ) {
    const savedUser = localStorage.getItem( 'forestPlus_user' );
    if ( savedUser ) {
      this.userSubject.next( JSON.parse( savedUser ) );
    }
  }

  /** 🔹 Observable para suscribirse a cambios del usuario */
  getUser (): Observable<UserResponseDto | null> {
    return this.userSubject.asObservable();
  }

  /** 🔹 Valor actual del usuario */
  getCurrentUser (): UserResponseDto | null {
    return this.userSubject.value;
  }

  /** 🔹 Actualiza usuario local y en localStorage */
  updateCurrentUser ( user: UserResponseDto ) {
    this.userSubject.next( user );
    localStorage.setItem( 'forestPlus_user', JSON.stringify( user ) );
  }

  /** 🔹 Limpia usuario */
  clearUser () {
    this.userSubject.next( null );
    localStorage.removeItem( 'forestPlus_user' );
  }

  /** 🔹 Wrapper de getUsers con paginación y filtros */
  getUsers (
    page: number = 0,
    size: number = 10,
    sort: string = 'id,asc',
    role?: RolesEnum,
    companyId?: number
  ): Observable<PageUserResponseDto> {
    return this.userController.getUsers(
      role,
      companyId,
      page,
      size,
      sort
    );
  }

  /** 🔹 Wrapper de getUserById */
  getUserById ( id: number ): Observable<UserResponseDto> {
    return this.userController.getUserById( id );
  }

  /** 🔹 Wrapper de updateUser */
  updateUser ( id: number, dto: RegisterUserRequestDto ): Observable<UserResponseDto> {
    return this.userController.updateUser( id, dto ).pipe(
      map( user => {
        // si es el usuario logueado, actualizar BehaviorSubject
        if ( this.userSubject.value?.id === user.id ) {
          this.updateCurrentUser( user );
        }
        return user;
      } )
    );
  }

  /** 🔹 Wrapper de updateUserByAdmin */
  updateUserByAdmin ( id: number, dto: RegisterUserByAdminRequestDto ): Observable<UserResponseDto> {
    return this.userController.updateUserByAdmin( id, dto );
  }

  /** 🔹 Wrapper de registerUserByAdmin */
  registerUserByAdmin ( dto: RegisterUserByAdminRequestDto ): Observable<UserResponseDto> {
    return this.userController.registerUserByAdmin( dto );
  }

  /** 🔹 Wrapper de deleteUser */
  deleteUser ( id: number ): Observable<any> {
    return this.userController.deleteUser( id );
  }

  /** Devuelve true si el usuario tiene rol ADMIN o COMPANY_ADMIN */
  isAdminOrCompanyAdmin (): boolean {
    const user = this.getCurrentUser();
    return !!user && ( user.role === RolesEnum.ADMIN || user.role === RolesEnum.COMPANY_ADMIN );
  }
}
