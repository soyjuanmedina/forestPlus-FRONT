import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';
import { take } from 'rxjs/operators';

describe( 'LoadingService', () => {
  let service: LoadingService;

  beforeEach( () => {
    TestBed.configureTestingModule( {} );
    service = TestBed.inject( LoadingService );
  } );

  it( 'should be created', () => {
    expect( service ).toBeTruthy();
  } );

  it( 'should emit true when show is called', ( done ) => {
    service.loading$.pipe( take( 1 ) ).subscribe( val => {
      expect( val ).toBe( false ); // valor inicial
    } );

    service.show();

    service.loading$.pipe( take( 1 ) ).subscribe( val => {
      expect( val ).toBe( true );
      done();
    } );
  } );

  it( 'should emit false when hide is called after show', ( done ) => {
    service.show();
    service.hide();

    service.loading$.pipe( take( 1 ) ).subscribe( val => {
      expect( val ).toBe( false );
      done();
    } );
  } );

  it( 'should not go negative if hide called too many times', ( done ) => {
    service.hide();
    service.loading$.pipe( take( 1 ) ).subscribe( val => {
      expect( val ).toBe( false );
      done();
    } );
  } );

  it( 'should remain true if multiple shows before hide', ( done ) => {
    service.show();
    service.show();
    service.hide(); // decrementa pero requests = 1, aún true

    service.loading$.pipe( take( 1 ) ).subscribe( val => {
      expect( val ).toBe( true );
      done();
    } );

    service.hide(); // ahora sí debe ser false
    service.loading$.pipe( take( 1 ) ).subscribe( val => {
      expect( val ).toBe( false );
    } );
  } );
} );
