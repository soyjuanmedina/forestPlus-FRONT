import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { UserResponseDto } from '../api/model/userResponse';

describe( 'AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach( () => {
    const authSpy = jasmine.createSpyObj( 'AuthService', [], { user$: of( null ) } );
    const routerSpyObj = jasmine.createSpyObj( 'Router', ['navigate'] );

    TestBed.configureTestingModule( {
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
      ]
    } );

    guard = TestBed.inject( AuthGuard );
    authServiceSpy = TestBed.inject( AuthService ) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject( Router ) as jasmine.SpyObj<Router>;
  } );

  it( 'should allow activation if user is logged in', ( done ) => {
    const mockUser: UserResponseDto = { id: 1, name: 'Juan', email: 'juan@juan.es', role: 'ADMIN' };
    Object.defineProperty( authServiceSpy, 'user$', { get: () => of( mockUser ) } );

    guard.canActivate().subscribe( result => {
      expect( result ).toBeTrue();
      expect( routerSpy.navigate ).not.toHaveBeenCalled();
      done();
    } );
  } );

  it( 'should prevent activation and redirect to /login if user is not logged in', ( done ) => {
    Object.defineProperty( authServiceSpy, 'user$', { get: () => of( null ) } );

    guard.canActivate().subscribe( result => {
      expect( result ).toBeFalse();
      expect( routerSpy.navigate ).toHaveBeenCalledWith( ['/login'] );
      done();
    } );
  } );
} );
