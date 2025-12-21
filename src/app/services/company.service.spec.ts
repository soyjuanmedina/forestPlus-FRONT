import { TestBed } from '@angular/core/testing';
import { CompanyService } from './company.service';
import { CompanyControllerService, CompanyUpdateRequestDto } from '../api';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CompanyResponseDto } from '../api/model/companyResponse';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

describe( 'CompanyService', () => {
  let service: CompanyService;
  let controllerSpy: jasmine.SpyObj<CompanyControllerService>;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  const mockCompany: CompanyResponseDto = { id: 1, name: 'forest Inc.', address: 'Calle Falsa 123' } as any;

  beforeEach( () => {
    const ctrlSpy = jasmine.createSpyObj( 'CompanyControllerService', [
      'getAllCompanies', 'getCompanyById', 'createCompany', 'updateCompany', 'deleteCompany'
    ] );

    TestBed.configureTestingModule( {
      imports: [HttpClientTestingModule],
      providers: [
        CompanyService,
        { provide: CompanyControllerService, useValue: ctrlSpy }
      ]
    } );

    service = TestBed.inject( CompanyService );
    controllerSpy = TestBed.inject( CompanyControllerService ) as jasmine.SpyObj<CompanyControllerService>;
    httpClient = TestBed.inject( HttpClient );
    httpMock = TestBed.inject( HttpTestingController );

    localStorage.clear();
  } );

  it( 'should be created', () => {
    expect( service ).toBeTruthy();
  } );

  it( 'should update and get current company', () => {
    service.updateCurrentCompany( mockCompany );
    service.getCompany().subscribe( c => expect( c ).toEqual( mockCompany ) );
    expect( service.getCurrentCompany() ).toEqual( mockCompany );
    expect( JSON.parse( localStorage.getItem( 'forestPlus_company' )! ) ).toEqual( mockCompany );
  } );

  it( 'should clear company', () => {
    service.updateCurrentCompany( mockCompany );
    service.clearCompany();
    expect( service.getCurrentCompany() ).toBeNull();
    expect( localStorage.getItem( 'forestPlus_company' ) ).toBeNull();
  } );

  it( 'getAllCompanies should call controller', ( done ) => {
    controllerSpy.getAllCompanies.and.returnValue( of( [mockCompany] ) as any );
    service.getAllCompanies().subscribe( list => {
      expect( list ).toEqual( [mockCompany] );
      done();
    } );
  } );

  it( 'getCompanyById should call controller and update current company', ( done ) => {
    controllerSpy.getCompanyById.and.returnValue( of( mockCompany ) as any );
    service.getCompanyById( 1 ).subscribe( company => {
      expect( company ).toEqual( mockCompany );
      expect( service.getCurrentCompany() ).toEqual( mockCompany );
      done();
    } );
  } );

  it( 'createCompany should call controller and update current company', ( done ) => {
    controllerSpy.createCompany.and.returnValue( of( mockCompany ) as any );
    service.createCompany( { name: 'forest Inc.' } ).subscribe( company => {
      expect( company ).toEqual( mockCompany );
      expect( service.getCurrentCompany() ).toEqual( mockCompany );
      done();
    } );
  } );

  it( 'updateCompany should update current company if IDs match', ( done ) => {
    service.updateCurrentCompany( mockCompany );
    const updated = { ...mockCompany, name: 'forest Updated' };
    controllerSpy.updateCompany.and.returnValue( of( updated ) as any );

    service.updateCompany( mockCompany.id!, { name: 'forest Updated' } ).subscribe( company => {
      expect( company.name ).toBe( 'forest Updated' );
      expect( service.getCurrentCompany()?.name ).toBe( 'forest Updated' );
      done();
    } );
  } );

  it( 'deleteCompany should clear current company if IDs match', ( done ) => {
    service.updateCurrentCompany( mockCompany );
    controllerSpy.deleteCompany.and.returnValue( of( { success: true } ) as any );

    service.deleteCompany( mockCompany.id! ).subscribe( res => {
      expect( res ).toEqual( { success: true } );
      expect( service.getCurrentCompany() ).toBeNull();
      done();
    } );
  } );

  it( 'updateCompanyPicture should call HTTP PUT and update current company', ( done ) => {
    const file = new File( ['dummy'], 'photo.png', { type: 'image/png' } );
    service.updateCurrentCompany( mockCompany );

    service.updateCompanyPicture( mockCompany.id!, file ).subscribe( company => {
      expect( company ).toEqual( mockCompany );
      expect( service.getCurrentCompany() ).toEqual( mockCompany );
      done();
    } );

    const req = httpMock.expectOne( `${environment.apiBaseUrl}/api/companies/${mockCompany.id}/picture` );
    expect( req.request.method ).toBe( 'PUT' );
    req.flush( mockCompany );
  } );

} );
