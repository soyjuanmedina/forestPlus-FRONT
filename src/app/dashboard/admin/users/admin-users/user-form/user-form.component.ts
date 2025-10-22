import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

import { RegisterUserRequestDto, UserResponseDto } from '../../../../../api';
import { CompanyService } from '../../../../../services/company.service';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { ROLES, RolesEnum } from '../../../../../models/roles';

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

    // 🆔 Si hay id en la ruta → modo edición
    this.route.paramMap.subscribe( params => {
      const id = params.get( 'id' );
      if ( id ) {
        this.isEditMode = true;
        this.userId = +id;
        this.loadUser( this.userId );
      }
    } );

    // Inicializamos el formulario
    this.userForm = this.fb.group( {
      name: ['', Validators.required],
      surname: ['', Validators.required],
      secondSurname: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength( 6 )]],
      role: [null as RolesEnum | null],
      companyId: [''],
    } );

    // Validación dinámica de companyId según rol
    this.userForm.get( 'role' )?.valueChanges.subscribe( ( role: RolesEnum ) => {
      const companyControl = this.userForm.get( 'companyId' );
      if ( role === RolesEnum.COMPANY_USER ) {
        companyControl?.setValidators( [Validators.required] );
        companyControl?.enable();
      } else {
        companyControl?.clearValidators();
        companyControl?.setValue( '' );
        companyControl?.disable();
      }
      companyControl?.updateValueAndValidity();
    } );

    // Cargar compañías
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
      // 👉 ahora actualizamos el usuario logueado desde AuthService
      this.authService.updateCurrentUser( user );
      this.router.navigate( ['/profile'] );
    } else {
      this.router.navigate( ['/admin/users'] );
    }
  }
}
