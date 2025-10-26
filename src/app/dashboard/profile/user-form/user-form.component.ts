import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ROLES, RolesEnum } from '../../../models/roles';
import { RegisterUserRequestDto, UserResponseDto } from '../../../api';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { CompanyService } from '../../../services/company.service';

@Component( {
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, MatIconModule]
} )
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  hidePassword = true;
  roles = ROLES;
  companies: any[] = [];
  registerSuccess = false;
  registerError = '';
  isEditMode = false;
  userId!: number;
  currentUser?: UserResponseDto;
  selectedFile?: File;
  previewImage?: string;
  user?: UserResponseDto;
  isSelfEdit = false;

  RolesEnum = RolesEnum;
  isCompanyAdmin = false;
  showCompanySelector = false;

  constructor (
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private companyService: CompanyService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit (): void {
    this.currentUser = this.authService.getUser() ?? undefined;
    this.isCompanyAdmin = this.currentUser?.role === RolesEnum.COMPANY_ADMIN;

    // Variable que controla la visibilidad del selector
    this.showCompanySelector = false;

    // Inicializamos el formulario
    this.userForm = this.fb.group( {
      name: ['', Validators.required],
      surname: ['', Validators.required],
      secondSurname: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength( 6 )]],
      role: [null as RolesEnum | null, Validators.required],
      companyId: [''],
    } );

    // Si hay id → modo edición
    this.route.paramMap.subscribe( ( params ) => {
      const id = params.get( 'id' );
      if ( id ) {
        this.isEditMode = true;
        this.userId = +id;
        this.loadUser( this.userId );
      }
    } );

    // Cargar roles permitidos según el rol actual
    this.configureAvailableRoles();

    // Comportamiento especial para COMPANY_ADMIN
    if ( this.isCompanyAdmin ) {
      this.showCompanySelector = true;
      this.userForm.get( 'companyId' )?.disable();

      // Cargamos las compañías y luego seteamos la suya
      this.companyService.getAllCompanies().subscribe( {
        next: ( data ) => {
          this.companies = data.filter( c => !!c.admin );

          const companyId = this.currentUser?.company?.id;
          if ( companyId ) {
            this.userForm.patchValue( { companyId } );
          }
        },
        error: ( err ) => console.error( 'Error cargando compañías', err )
      } );
    } else {
      this.loadCompanies();
    }

    // Validación dinámica del campo companyId según el rol
    this.userForm.get( 'role' )?.valueChanges.subscribe( ( role: RolesEnum ) => {
      const companyControl = this.userForm.get( 'companyId' );

      if ( role === RolesEnum.COMPANY_USER || this.isCompanyAdmin ) {
        this.showCompanySelector = true; // 👈 Mostrar selector
        companyControl?.setValidators( [Validators.required] );
        if ( !this.isCompanyAdmin ) companyControl?.enable();
      } else {
        this.showCompanySelector = false; // 👈 Ocultar selector
        companyControl?.clearValidators();
        if ( !this.isCompanyAdmin ) {
          companyControl?.setValue( '' );
          companyControl?.disable();
        }
      }

      companyControl?.updateValueAndValidity();
    } );
  }


  private configureAvailableRoles () {
    if ( !this.currentUser ) return;

    if ( this.currentUser.role === RolesEnum.ADMIN ) {
      // Super Admin puede ver todos los roles
      this.roles = ROLES;
    } else if ( this.currentUser.role === RolesEnum.COMPANY_ADMIN ) {
      // Company Admin solo puede crear COMPANY_ADMIN o COMPANY_USER
      this.roles = ROLES.filter(
        r => r.value === RolesEnum.COMPANY_ADMIN || r.value === RolesEnum.COMPANY_USER
      );
    }
  }

  private loadCompanies () {
    this.companyService.getAllCompanies().subscribe( {
      next: data => {
        this.companies = data.filter( c => !!c.admin );
      },
      error: err => console.error( 'Error cargando compañías', err )
    } );
  }

  private loadUser ( id: number ) {
    this.userService.getUserById( id ).subscribe( {
      next: ( user: UserResponseDto ) => {
        this.user = user;
        this.previewImage = user.picture;
        this.isSelfEdit = this.currentUser?.id === this.userId;

        this.userForm.patchValue( {
          name: user.name,
          surname: user.surname,
          secondSurname: user.secondSurname,
          email: user.email,
          role: user.role,
          companyId: user.company?.id ?? '',
        } );

        if ( this.isSelfEdit ) {
          // Si es self edit, limitar campos
          this.userForm.get( 'role' )?.disable();
          this.userForm.get( 'companyId' )?.disable();
          this.userForm.get( 'password' )?.disable();
        } else {
          // Admin no puede cambiar email
          this.userForm.get( 'email' )?.disable();
        }
      },
      error: err => console.error( '❌ Error al cargar usuario', err )
    } );
  }

  onFileSelected ( event: any ): void {
    const file: File = event.target.files[0];
    if ( file ) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => ( this.previewImage = reader.result as string );
      reader.readAsDataURL( file );
    }
  }

  onSubmit (): void {
    if ( this.userForm.invalid ) return;

    const dto: RegisterUserRequestDto = this.userForm.getRawValue();

    // Si es COMPANY_ADMIN, forzamos su companyId
    if ( this.isCompanyAdmin ) {
      dto.companyId = this.currentUser?.company?.id ?? undefined;
    }

    let update$;

    if ( this.selectedFile && this.isEditMode ) {
      update$ = this.userService.updateUserPicture( this.userId, this.selectedFile );
    } else if ( this.isEditMode ) {
      update$ = this.isSelfEdit
        ? this.userService.updateUser( this.userId, dto )
        : this.userService.updateUserByAdmin( this.userId, dto );
    } else {
      update$ = this.userService.registerUserByAdmin( dto );
    }

    update$.subscribe( {
      next: ( updatedUser: UserResponseDto ) => {
        this.finalizeUpdate( updatedUser );
      },
      error: err => {
        this.registerError = err.error?.message || 'Error al guardar usuario';
        this.registerSuccess = false;
        console.error( err );
      }
    } );
  }

  private finalizeUpdate ( user: UserResponseDto ) {
    this.user = user;
    this.previewImage = user.picture;
    this.selectedFile = undefined;
    this.snackBar.open( '✅ Usuario actualizado con éxito', 'Cerrar', { duration: 3000 } );

    if ( this.isSelfEdit ) {
      this.authService.updateCurrentUser( user );
      this.router.navigate( ['/profile'] );
    } else {
      this.router.navigate( ['/admin/users'] );
    }
  }
}
