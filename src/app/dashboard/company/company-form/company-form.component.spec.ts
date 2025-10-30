import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CompanyFormComponent } from './company-form.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CompanyService } from '../../../services/company.service';
import { CompanyCo2Service } from '../../../services/company-co2.service';
import { UserService } from '../../../services/user.service';
import { CompanyResponseDto, CompanyCO2YearlyRequestDto, UserResponseDto } from '../../../api';

describe( 'CompanyFormComponent', () => {
  let component: CompanyFormComponent;
  let fixture: ComponentFixture<CompanyFormComponent>;
  let companyServiceSpy: jasmine.SpyObj<CompanyService>;
  let companyCo2ServiceSpy: jasmine.SpyObj<CompanyCo2Service>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach( async () => {
    const activatedRouteStub = { snapshot: { paramMap: { get: () => '2' } } } as unknown as ActivatedRoute;

    companyServiceSpy = jasmine.createSpyObj( 'CompanyService', ['getCompanyById', 'createCompany', 'updateCompany', 'updateCompanyPicture'] );
    companyCo2ServiceSpy = jasmine.createSpyObj( 'CompanyCo2Service', ['save', 'delete'] );
    userServiceSpy = jasmine.createSpyObj( 'UserService', ['getUser', 'getCurrentUser$'] );
    routerSpy = jasmine.createSpyObj( 'Router', ['navigate'] );

    // Spies por defecto
    companyServiceSpy.getCompanyById.and.returnValue( of( { id: 2, name: 'Test Company', address: '', co2: [] } as CompanyResponseDto ) );
    companyServiceSpy.createCompany.and.returnValue( of( { id: 3, name: 'New Company', address: '', co2: [] } as CompanyResponseDto ) );
    companyServiceSpy.updateCompanyPicture.and.returnValue( of( { id: 2, name: 'Test Company', address: '', co2: [] } as CompanyResponseDto ) );
    companyServiceSpy.updateCompany.and.returnValue( of( { id: 2, name: 'Test Company', address: '', co2: [] } as CompanyResponseDto ) );
    companyCo2ServiceSpy.save.and.returnValue( of( { id: 1 } ) );
    companyCo2ServiceSpy.delete.and.returnValue( of( null ) as any );
    userServiceSpy.getUser.and.returnValue( of( { id: 1, role: 'ADMIN' } as UserResponseDto ) );
    userServiceSpy.getCurrentUser$.and.returnValue( of( { id: 1, role: 'ADMIN' } as UserResponseDto ) );

    await TestBed.configureTestingModule( {
      imports: [ReactiveFormsModule, CompanyFormComponent],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
        { provide: CompanyService, useValue: companyServiceSpy },
        { provide: CompanyCo2Service, useValue: companyCo2ServiceSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    } ).compileComponents();

    fixture = TestBed.createComponent( CompanyFormComponent );
    component = fixture.componentInstance;
  } );

  it( 'should create component and initialize form', () => {
    fixture.detectChanges();
    expect( component ).toBeTruthy();
    expect( component.companyForm ).toBeDefined();
    expect( component.companyForm.controls['name'] ).toBeDefined();
    expect( component.companyForm.controls['address'] ).toBeDefined();
  } );

  it( 'should load company on init if id exists', fakeAsync( () => {
    fixture.detectChanges();
    tick(); // Para que se ejecute el subscribe
    expect( companyServiceSpy.getCompanyById ).toHaveBeenCalledWith( 2 );
    expect( component.company.id ).toBe( 2 );
    expect( component.company.name ).toBe( 'Test Company' );
  } ) );

  it( 'should create new company on submit if id undefined', fakeAsync( () => {
    // Inicializamos el form (initForm es private)
    component['initForm']();

    // Aseguramos que el company.id sea undefined (crear nueva compañía)
    component.company.id = undefined;

    // Seteamos valores válidos en el form
    component.companyForm.setValue( { name: 'New Company', address: '' } );

    // Spy del servicio ya debería estar creado en beforeEach
    const createSpy = companyServiceSpy.createCompany.and.returnValue( of( { id: 1, name: 'New Company', address: '', co2: [] } ) );

    // Llamamos al submit
    component.onSubmitCompany();
    tick(); // avanzamos observables

    // Verificamos que se haya llamado al createCompany
    expect( createSpy ).toHaveBeenCalledWith( { name: 'New Company', address: '' } );

    // Opcional: verificamos que company se haya actualizado
    expect( component.company.id ).toBe( 1 as any );
    expect( component.company.name ).toBe( 'New Company' );
  } ) );


  it( 'should update company picture on submit if selectedFile exists', fakeAsync( () => {
    component.companyForm = component['fb'].group( {
      name: ['Test Company'],
      address: ['']
    } );
    component.company.id = 2;
    component.selectedFile = new File( [''], 'test.png', { type: 'image/png' } );
    companyServiceSpy.updateCompanyPicture.and.returnValue( of( component.company ) );
    const selectedFileCopy = component.selectedFile;
    component.onSubmitCompany();
    tick();
    expect( companyServiceSpy.updateCompanyPicture ).toHaveBeenCalledWith(
      2,
      selectedFileCopy
    );
  } ) );






  it( 'should add new CO2 year', fakeAsync( () => {
    component.company.id = 2;
    component.addNewYear( 2025 );
    tick();
    expect( companyCo2ServiceSpy.save ).toHaveBeenCalledWith( 2, jasmine.objectContaining( { year: 2025 } ) );
  } ) );

  it( 'should delete CO2 year', fakeAsync( () => {
    component.company.id = 2;
    const year = { id: 1, year: 2023, totalEmissions: 10, totalCompensations: 5 } as any;
    component.co2Years.push( year );
    component.deleteCO2( year );
    tick();
    expect( companyCo2ServiceSpy.delete ).toHaveBeenCalledWith( 2, 1 );
  } ) );
} );
