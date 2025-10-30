import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AuthControllerService } from '../api';
import { Router } from '@angular/router';
import { of, throwError, from } from 'rxjs';
import { UserResponseDto } from '../api/model/userResponse';
import { RegisterUserRequestDto } from '../api/model/registerUserRequest';
import { ResetPasswordRequestDto } from '../api/model/resetPasswordRequest';
import { AuthResponseDto, MessageResponseDto } from '../api';

describe( 'AuthService', () => {
  let service: AuthService;
  let authApiSpy: jasmine.SpyObj<AuthControllerService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: UserResponseDto = {
    id: 1,
    name: 'juan',
    email: 'juan@juan.es',
    role: 'ADMIN',
    company: { id: 100, name: 'Forest Inc.' }
  } as any;

  beforeEach( () => {
    const authSpy = jasmine.createSpyObj( 'AuthControllerService', [
      'login', 'register', 'forgotPassword', 'resetPassword',
      'resetForgotPassword', 'verifyEmail', 'resendVerification', 'refreshToken'
    ] );
    const routerMock = jasmine.createSpyObj( 'Router', ['navigate'] );

    TestBed.configureTestingModule( {
      providers: [
        AuthService,
        { provide: AuthControllerService, useValue: authSpy },
        { provide: Router, useValue: routerMock }
      ]
    } );

    service = TestBed.inject( AuthService );
    authApiSpy = TestBed.inject( AuthControllerService ) as jasmine.SpyObj<AuthControllerService>;
    routerSpy = TestBed.inject( Router ) as jasmine.SpyObj<Router>;

    // Inicializamos BehaviorSubject con mockUser
    ( service as any ).userSubject.next( mockUser );
    localStorage.clear();
  } );

  it( 'should be created', () => {
    expect( service ).toBeTruthy();
  } );

  it( 'should return current user and login status', () => {
    expect( service.getUser() ).toEqual( mockUser );
    expect( service.isLoggedIn() ).toBeTrue();
  } );

  it( 'logout should clear user and navigate', () => {
    service.logout();
    expect( service.getUser() ).toBeNull();
    expect( routerSpy.navigate ).toHaveBeenCalledWith( ['/login'] );
  } );

  it( 'login should set user and token', ( done ) => {
    const dto: RegisterUserRequestDto = { email: 'juan@juan.es', password: '123' } as any;
    authApiSpy.login.and.returnValue( of( { user: mockUser, token: 'abc123' } as AuthResponseDto ) as any );

    service.login( dto ).subscribe( user => {
      expect( user ).toEqual( mockUser );
      expect( service.getUser() ).toEqual( mockUser );
      expect( localStorage.getItem( 'forestPlus_token' ) ).toBe( 'abc123' );
      done();
    } );
  } );

  it( 'login with Blob user should parse correctly', ( done ) => {
    const blob = new Blob( [JSON.stringify( mockUser )], { type: 'application/json' } );
    const dto: RegisterUserRequestDto = { email: 'juan@juan.es', password: '123' } as any;
    authApiSpy.login.and.returnValue( of( { user: blob, token: 'abc123' } as any ) );

    service.login( dto ).subscribe( user => {
      expect( user ).toEqual( mockUser );
      expect( service.getUser() ).toEqual( mockUser );
      done();
    } );
  } );

  it( 'login should throw if no user', ( done ) => {
    const dto: RegisterUserRequestDto = { email: 'juan@juan.es', password: '123' } as any;
    authApiSpy.login.and.returnValue( of( { user: null, token: 'abc123' } as any ) );

    service.login( dto ).subscribe( {
      next: () => fail( 'expected error' ),
      error: err => {
        expect( err ).toBeTruthy();
        done();
      }
    } );
  } );

  it( 'register should set user', ( done ) => {
    const dto: RegisterUserRequestDto = { email: 'juan@juan.es', password: '123' } as any;
    authApiSpy.register.and.returnValue( of( mockUser ) as any );

    service.register( dto ).subscribe( user => {
      expect( user ).toEqual( mockUser );
      expect( service.getUser() ).toEqual( mockUser );
      done();
    } );
  } );

  it( 'forgotPassword should call API', ( done ) => {
    authApiSpy.forgotPassword.and.returnValue( of( { message: 'ok' } as any ) );
    service.forgotPassword( 'juan@juan.es' ).subscribe( resp => {
      expect( resp ).toEqual( { message: 'ok' } as MessageResponseDto );
      done();
    } );
  } );

  it( 'resetPassword for logged in user should call API', ( done ) => {
    localStorage.setItem( 'forestPlus_token', 'abc123' );
    const payload: ResetPasswordRequestDto = { password: 'new' } as any;
    authApiSpy.resetPassword.and.returnValue( of( { message: 'ok' } as any ) );

    service.resetPassword( payload ).subscribe( resp => {
      expect( resp ).toEqual( { message: 'ok' } as MessageResponseDto );
      done();
    } );
  } );

  it( 'resetPassword without token should throw', () => {
    localStorage.removeItem( 'forestPlus_token' );
    const payload: ResetPasswordRequestDto = { password: 'new' } as any;
    expect( () => service.resetPassword( payload ) ).toThrowError( 'No hay token de usuario logueado' );
  } );

  it( 'verifyEmail should call API', ( done ) => {
    authApiSpy.verifyEmail.and.returnValue( of( { success: true } as any ) );
    service.verifyEmail( 'uuid123' ).subscribe( resp => {
      expect( resp ).toEqual( { success: true } );
      done();
    } );
  } );

  it( 'updateCurrentUser should update BehaviorSubject and localStorage', () => {
    service.updateCurrentUser( mockUser );
    expect( service.getUser() ).toEqual( mockUser );
    expect( JSON.parse( localStorage.getItem( 'forestPlus_user' )! ) ).toEqual( mockUser );
  } );

  it( 'refreshToken should update user and token', ( done ) => {
    localStorage.setItem( 'forestPlus_refresh_token', 'refresh123' );
    authApiSpy.refreshToken.and.returnValue( of( { user: mockUser, token: 'newToken', refreshToken: 'newRefresh' } as any ) );

    service.refreshToken().subscribe( resp => {
      expect( service.getUser() ).toEqual( mockUser );
      expect( localStorage.getItem( 'forestPlus_token' ) ).toBe( 'newToken' );
      expect( localStorage.getItem( 'forestPlus_refresh_token' ) ).toBe( 'newRefresh' );
      done();
    } );
  } );

  it( 'refreshToken without token should logout and throw', ( done ) => {
    service.logout(); // limpiar
    service.refreshToken().subscribe( {
      next: () => fail( 'expected error' ),
      error: err => {
        expect( service.getUser() ).toBeNull();
        expect( err.message ).toBe( 'No refresh token found' );
        done();
      }
    } );
  } );

  it( 'currentUserRole and currentUserCompanyId getters', () => {
    expect( service.currentUserRole ).toBe( 'ADMIN' );
    expect( service.currentUserCompanyId ).toBe( 100 );
  } );
} );
