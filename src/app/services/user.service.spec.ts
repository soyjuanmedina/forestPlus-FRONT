import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { UserControllerService } from '../api';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { RolesEnum } from '../models/roles';
import { environment } from '../../environments/environment';
import { UserResponseDto, RegisterUserRequestDto, RegisterUserByAdminRequestDto, PageUserResponseDto } from '../api';

describe( 'UserService', () => {
  let service: UserService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userControllerSpy: jasmine.SpyObj<UserControllerService>;
  let httpMock: HttpTestingController;

  const mockUser: UserResponseDto = {
    id: 1,
    name: 'juan',
    email: 'juan@juan.es',
    role: RolesEnum.ADMIN
  };

  beforeEach( () => {
    const authSpy = jasmine.createSpyObj( 'AuthService', ['getUser', 'updateCurrentUser'], ['user$'] );
    const userCtrlSpy = jasmine.createSpyObj( 'UserControllerService', [
      'getUsers',
      'getUserById',
      'updateUser',
      'updateUserByAdmin',
      'registerUserByAdmin',
      'deleteUser'
    ] );

    TestBed.configureTestingModule( {
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: AuthService, useValue: authSpy },
        { provide: UserControllerService, useValue: userCtrlSpy }
      ]
    } );

    service = TestBed.inject( UserService );
    authServiceSpy = TestBed.inject( AuthService ) as jasmine.SpyObj<AuthService>;
    userControllerSpy = TestBed.inject( UserControllerService ) as jasmine.SpyObj<UserControllerService>;
    httpMock = TestBed.inject( HttpTestingController );

    // Observables
    Object.defineProperty( authServiceSpy, 'user$', { get: () => of( mockUser ) } );

    authServiceSpy.getUser.and.returnValue( mockUser );
  } );

  afterEach( () => {
    httpMock.verify();
  } );

  it( 'getCurrentUser should return current user', () => {
    const user = service.getCurrentUser();
    expect( user ).toEqual( mockUser );
  } );

  it( 'isAdminOrCompanyAdmin should return true for admin', () => {
    expect( service.isAdminOrCompanyAdmin() ).toBeTrue();
  } );

  it( 'updateUser should update AuthService if current user', () => {
    const updatedUser: UserResponseDto = { ...mockUser, name: 'nuevo' };
    const httpResp = new HttpResponse( { body: updatedUser } );

    // Simulamos que el controller devuelve HttpResponse
    userControllerSpy.updateUser.and.returnValue( of( updatedUser ) as any );

    service.updateUser( mockUser.id!, {} as RegisterUserRequestDto ).subscribe( user => {
      // user aquí es el body desenvuelto, tipo UserResponseDto
      expect( user.name ).toBe( 'nuevo' );
      expect( authServiceSpy.updateCurrentUser ).toHaveBeenCalledWith( updatedUser );
    } );
  } );

  it( 'updateUserPicture should call HTTP PUT and update AuthService', () => {
    const updatedUser: UserResponseDto = { ...mockUser, name: 'nuevo' };
    const file = new File( [''], 'avatar.png', { type: 'image/png' } );

    service.updateUserPicture( mockUser.id!, file ).subscribe( resp => {
      expect( resp.name ).toBe( 'nuevo' );
      expect( authServiceSpy.updateCurrentUser ).toHaveBeenCalledWith( updatedUser );
    } );

    const req = httpMock.expectOne( `${environment.apiBaseUrl}/api/users/${mockUser.id}/picture` );
    expect( req.request.method ).toBe( 'PUT' );
    req.flush( updatedUser ); // Mock response
  } );

  it( 'getUsers should call UserControllerService.getUsers', () => {
    const pageResponse: PageUserResponseDto = { content: [mockUser], totalElements: 1, totalPages: 1, size: 10, number: 0 };
    userControllerSpy.getUsers.and.returnValue( of( pageResponse ) as any );

    service.getUsers().subscribe( resp => {
      expect( resp.content?.length ).toBe( 1 );
    } );
  } );

  it( 'getUserById should call UserControllerService.getUserById', () => {
    userControllerSpy.getUserById.and.returnValue( of( mockUser ) as any );

    service.getUserById( 1 ).subscribe( resp => {
      expect( resp ).toEqual( mockUser );
    } );
  } );
} );
