import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UserResponseDto } from '../api/model/userResponse';
import { RegisterUserRequestDto } from '../api/model/registerUserRequest';
import { RegisterUserByAdminRequestDto } from '../api/model/registerUserByAdminRequest';
import { PageUserResponseDto, UserControllerService } from '../api';
import { RolesEnum } from '../models/roles';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable( {
  providedIn: 'root'
} )
export class UserService {
  constructor (
    private userController: UserControllerService,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  user$ = this.authService.user$;

  getUser (): Observable<UserResponseDto | null> {
    return this.authService.user$;
  }

  updateCurrentUser ( user: UserResponseDto ) {
    this.authService.updateCurrentUser( user ); // delega al AuthService
  }

  /** 🔹 Delegar la obtención del usuario actual al AuthService */
  getCurrentUser (): UserResponseDto | null {
    return this.authService.getUser();
  }

  /** 🔹 Delegar si quieres observar cambios de usuario logueado */
  getCurrentUser$ () {
    return this.authService.user$;
  }

  /** 🔹 CRUD de usuarios para admin */
  getUsers (
    page: number = 0,
    size: number = 10,
    sort: string = 'id,asc',
    role?: RolesEnum,
    companyId?: number
  ): Observable<PageUserResponseDto> {
    return this.userController.getUsers( role, companyId, page, size, sort );
  }

  getUserById ( id: number ): Observable<UserResponseDto> {
    return this.userController.getUserById( id );
  }

  updateUser ( id: number, dto: RegisterUserRequestDto ): Observable<UserResponseDto> {
    return this.userController.updateUser( id, dto ).pipe(
      map( user => {
        // Si actualiza su propio perfil, actualizar también el AuthService
        if ( this.getCurrentUser()?.id === user.id ) {
          this.authService.updateCurrentUser( user );
        }
        return user;
      } )
    );
  }

  updateUserByAdmin ( id: number, dto: RegisterUserByAdminRequestDto ): Observable<UserResponseDto> {
    return this.userController.updateUserByAdmin( id, dto );
  }

  registerUserByAdmin ( dto: RegisterUserByAdminRequestDto ): Observable<UserResponseDto> {
    return this.userController.registerUserByAdmin( dto );
  }

  deleteUser ( id: number ): Observable<any> {
    return this.userController.deleteUser( id );
  }

  isAdminOrCompanyAdmin (): boolean {
    const user = this.getCurrentUser();
    return !!user && ( user.role === RolesEnum.ADMIN || user.role === RolesEnum.COMPANY_ADMIN );
  }

  /** 🔹 Subir imagen de perfil */
  updateUserPicture ( id: number, file: File ): Observable<UserResponseDto> {
    const formData = new FormData();
    formData.append( 'file', file );

    return this.http.put<UserResponseDto>(
      `${environment.apiBaseUrl}/api/users/${id}/picture`,
      formData
    ).pipe(
      map( user => {
        if ( this.getCurrentUser()?.id === user.id ) {
          this.authService.updateCurrentUser( user );
        }
        return user;
      } )
    );
  }
}
