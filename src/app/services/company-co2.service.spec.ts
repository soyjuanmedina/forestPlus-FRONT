import { TestBed } from '@angular/core/testing';
import { CompanyCo2Service } from './company-co2.service';
import { CompanyCo2YearlyControllerService } from '../api/api/companyCo2YearlyController.service';
import { CompanyCO2YearlyRequestDto } from '../api/model/companyCO2YearlyRequest';
import { CompanyCO2YearlyResponseDto } from '../api/model/companyCO2YearlyResponse';
import { of } from 'rxjs';

describe( 'CompanyCo2Service', () => {
  let service: CompanyCo2Service;
  let apiSpy: jasmine.SpyObj<CompanyCo2YearlyControllerService>;

  const mockCo2: CompanyCO2YearlyResponseDto = { id: 1, year: 2024, co2: 123 } as any;
  const mockRequest: CompanyCO2YearlyRequestDto = { year: 2024, co2: 123 } as any;

  beforeEach( () => {
    const spy = jasmine.createSpyObj( 'CompanyCo2YearlyControllerService', ['getAll', 'createOrUpdate', '_delete'] );

    TestBed.configureTestingModule( {
      providers: [
        CompanyCo2Service,
        { provide: CompanyCo2YearlyControllerService, useValue: spy }
      ]
    } );

    service = TestBed.inject( CompanyCo2Service );
    apiSpy = TestBed.inject( CompanyCo2YearlyControllerService ) as jasmine.SpyObj<CompanyCo2YearlyControllerService>;
  } );

  it( 'should be created', () => {
    expect( service ).toBeTruthy();
  } );

  it( 'getAll should return list of CO2 records', ( done ) => {
    apiSpy.getAll.and.returnValue( of( [mockCo2] ) as any );

    service.getAll( 1 ).subscribe( res => {
      expect( res ).toEqual( [mockCo2] );
      expect( apiSpy.getAll ).toHaveBeenCalledWith( 1 );
      done();
    } );
  } );

  it( 'save should call createOrUpdate and return updated record', ( done ) => {
    apiSpy.createOrUpdate.and.returnValue( of( mockCo2 ) as any );

    service.save( 1, mockRequest ).subscribe( res => {
      expect( res ).toEqual( mockCo2 );
      expect( apiSpy.createOrUpdate ).toHaveBeenCalledWith( 1, mockRequest );
      done();
    } );
  } );

  it( 'delete should call _delete with correct IDs', ( done ) => {
    apiSpy._delete.and.returnValue( of( void 0 ) as any );

    service.delete( 1, 2 ).subscribe( res => {
      expect( res ).toBeUndefined();
      expect( apiSpy._delete ).toHaveBeenCalledWith( 1, 2 );
      done();
    } );
  } );
} );
