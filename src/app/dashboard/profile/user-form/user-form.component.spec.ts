import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormComponent } from './user-form.component';
import { UserService } from '../../../services/user.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
import { RolesEnum } from '../../../models/roles';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe( 'UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let companyServiceSpy: jasmine.SpyObj<CompanyService>;
  let authServiceMock: any;

  const mockUser = {
    id: 103,
    role: RolesEnum.USER,
    company: { id: 1 },
    email: 'test@forestplus.com',
    name: 'Test User',
    surname: 'Example',
    secondSurname: '',
    picture: ''
  };

  beforeEach( async () => {
    // 🔹 Mocks de servicios
    authServiceMock = {
      user$: of( mockUser ),
      getUser: () => mockUser,
      updateCurrentUser: jasmine.createSpy( 'updateCurrentUser' ),
      currentUserRole: mockUser.role,
      currentUserCompanyId: mockUser.company.id
    };

    userServiceSpy = jasmine.createSpyObj( 'UserService', [
      'getCurrentUser',
      'updateUser',
      'updateUserByAdmin',
      'getUserById',
      'updateUserPicture',
      'registerUserByAdmin'
    ] );

    userServiceSpy.getCurrentUser.and.returnValue( mockUser );
    userServiceSpy.getUserById.and.returnValue( of( mockUser ) );
    userServiceSpy.updateUser.and.returnValue( of( mockUser ) );
    userServiceSpy.updateUserByAdmin.and.returnValue( of( mockUser ) );
    userServiceSpy.updateUserPicture.and.returnValue( of( mockUser ) );
    userServiceSpy.registerUserByAdmin.and.returnValue( of( mockUser ) );

    companyServiceSpy = jasmine.createSpyObj( 'CompanyService', ['getAllCompanies'] );
    companyServiceSpy.getAllCompanies.and.returnValue( of( [
      { id: 1, users: [{ role: RolesEnum.COMPANY_ADMIN }] },
      { id: 2, users: [{ role: RolesEnum.USER }] }
    ] ) );

    const translateServiceMock = {
      instant: ( key: string ) => key,
      get: () => of( '' ),
      use: () => { },
      setDefaultLang: () => { }
    };

    await TestBed.configureTestingModule( {
      imports: [
        NoopAnimationsModule,
        UserFormComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: CompanyService, useValue: companyServiceSpy },
        { provide: AuthService, useValue: authServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of( new Map( [['id', '103']] ) ) }
        }
      ]
    } ).compileComponents();

    fixture = TestBed.createComponent( UserFormComponent );
    component = fixture.componentInstance;
  } );

  it( 'debería marcar isSelfEdit=true y NO llamar a loadCompanies', () => {
    spyOn<any>( component, 'loadCompanies' );
    component.ngOnInit();

    expect( component.isEditMode ).toBeTrue();
    expect( component.isSelfEdit ).toBeTrue();
    expect( ( component as any ).loadCompanies ).not.toHaveBeenCalled();
  } );

  it( 'debería usar updateUser (no updateUserByAdmin) al guardar su perfil', () => {
    userServiceSpy.updateUser.and.returnValue( of( mockUser ) );

    component.ngOnInit();
    component.userForm.setValue( {
      name: 'Nuevo nombre',
      surname: 'Apellido',
      secondSurname: '',
      email: 'test@forestplus.com',
      password: '',
      role: RolesEnum.USER,
      companyId: ''
    } );

    component.onSubmit();

    expect( userServiceSpy.updateUser ).toHaveBeenCalled();
    expect( userServiceSpy.updateUserByAdmin ).not.toHaveBeenCalled();
  } );

  it( 'debería mostrar selector de compañía solo para roles COMPANY_ADMIN o COMPANY_USER', () => {
    component.ngOnInit();
    component.userForm.get( 'role' )?.setValue( RolesEnum.COMPANY_ADMIN );
    expect( component.showCompanySelectorDynamic() ).toBeTrue();

    component.userForm.get( 'role' )?.setValue( RolesEnum.USER );
    expect( component.showCompanySelectorDynamic() ).toBeFalse();
  } );

  it( 'debería actualizar previewImage y selectedFile al seleccionar archivo', () => {
    const file = new File( ['dummy'], 'foto.png', { type: 'image/png' } );
    const event = { target: { files: [file] } };

    component.onFileSelected( event );
    expect( component.selectedFile ).toBe( file );
  } );

  it( 'debería navegar correctamente al cancelar según self-edit', () => {
    const routerSpy = spyOn( ( component as any ).router, 'navigate' );

    component.isSelfEdit = true;
    component.onCancel();
    expect( routerSpy ).toHaveBeenCalledWith( ['/profile'] );

    component.isSelfEdit = false;
    component.onCancel();
    expect( routerSpy ).toHaveBeenCalledWith( ['/admin/users'] );
  } );

  it( 'debería limitar roles para COMPANY_ADMIN', () => {
    const mockCompanyAdminUser = { ...mockUser, role: RolesEnum.COMPANY_ADMIN };
    authServiceMock.getUser = () => mockCompanyAdminUser;

    component.ngOnInit();

    const allowedRoles = [RolesEnum.COMPANY_ADMIN, RolesEnum.COMPANY_USER];
    const rolesValues = component.roles.map( r => r.value );

    rolesValues.forEach( value => {
      expect( allowedRoles ).toContain( value );
    } );

    expect( rolesValues.every( v => allowedRoles.includes( v ) ) ).toBeTrue();
  } );

  it( 'debería dejar todos los roles para ADMIN', () => {
    component.currentUser = { ...mockUser, role: RolesEnum.ADMIN };
    component.ngOnInit();
    expect( component.roles.length ).toBeGreaterThan( 2 );
  } );

  it( 'debería navegar a /profile si es self-edit al finalizar update', () => {
    const routerSpy = spyOn( ( component as any ).router, 'navigate' );
    component.isSelfEdit = true;
    ( component as any ).finalizeUpdate( mockUser );
    expect( routerSpy ).toHaveBeenCalledWith( ['/profile'] );
    expect( authServiceMock.updateCurrentUser ).toHaveBeenCalledWith( mockUser );
  } );

  it( 'debería navegar a /admin/users si no es self-edit al finalizar update', () => {
    const routerSpy = spyOn( ( component as any ).router, 'navigate' );
    component.isSelfEdit = false;
    ( component as any ).finalizeUpdate( mockUser );
    expect( routerSpy ).toHaveBeenCalledWith( ['/adfasdfasfaadmin/users'] );
  } );
} );
