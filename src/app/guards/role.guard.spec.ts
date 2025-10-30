import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { UserService } from '../services/user.service';
import { RolesEnum } from '../models/roles';
import { UserResponseDto } from '../api/model/userResponse';

describe( 'RoleGuard', () => {
  let guard: RoleGuard;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSnapshot: ActivatedRouteSnapshot;

  beforeEach( () => {
    const userSpy = jasmine.createSpyObj( 'UserService', ['getCurrentUser'] );
    const routerSpyObj = jasmine.createSpyObj( 'Router', ['navigate'] );

    TestBed.configureTestingModule( {
      providers: [
        RoleGuard,
        { provide: UserService, useValue: userSpy },
        { provide: Router, useValue: routerSpyObj },
      ]
    } );

    guard = TestBed.inject( RoleGuard );
    userServiceSpy = TestBed.inject( UserService ) as jasmine.SpyObj<UserService>;
    routerSpy = TestBed.inject( Router ) as jasmine.SpyObj<Router>;

    routeSnapshot = new ActivatedRouteSnapshot();
  } );

  it( 'should redirect to /login if no user', () => {
    userServiceSpy.getCurrentUser.and.returnValue( null );
    routeSnapshot.data = { roles: [RolesEnum.ADMIN] };

    const result = guard.canActivate( routeSnapshot );
    expect( result ).toBeFalse();
    expect( routerSpy.navigate ).toHaveBeenCalledWith( ['/login'] );
  } );

  it( 'should allow access if user has allowed role', () => {
    const mockUser: UserResponseDto = { id: 1, name: 'Juan', email: 'juan@juan.es', role: RolesEnum.ADMIN };
    userServiceSpy.getCurrentUser.and.returnValue( mockUser );
    routeSnapshot.data = { roles: [RolesEnum.ADMIN, RolesEnum.USER] };

    const result = guard.canActivate( routeSnapshot );
    expect( result ).toBeTrue();
    expect( routerSpy.navigate ).not.toHaveBeenCalled();
  } );

  it( 'should redirect to /dashboard if user has role not allowed', () => {
    const mockUser: UserResponseDto = { id: 1, name: 'Juan', email: 'juan@juan.es', role: RolesEnum.USER };
    userServiceSpy.getCurrentUser.and.returnValue( mockUser );
    routeSnapshot.data = { roles: [RolesEnum.ADMIN] };

    const result = guard.canActivate( routeSnapshot );
    expect( result ).toBeFalse();
    expect( routerSpy.navigate ).toHaveBeenCalledWith( ['/dashboard'] );
  } );
} );
