import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterUserRequestDto, UserResponseDto } from '../../../../../api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyService } from '../../../../../services/company.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ROLES, RolesEnum } from '../../../../../core/constants/roles';


@Component( {
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
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

  constructor (
    private fb: FormBuilder,
    private userService: UserService,
    private companyService: CompanyService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) { }
  RolesEnum = RolesEnum;

  ngOnInit (): void {

    // 🆔 Si hay id en la ruta → estamos editando
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
      password: ['', [Validators.required, Validators.minLength( 6 )]],
      role: [null as RolesEnum | null, Validators.required],
      companyId: [''],
    } );

    // Cargar compañías
    this.companyService.getAllCompanies().subscribe( {
      next: ( data ) => this.companies = data,
      error: ( err ) => console.error( 'Error cargando compañías', err )
    } );

    // Validación dinámica de campo companyId según el rol
    this.userForm.get( 'role' )?.valueChanges.subscribe( ( role: RolesEnum ) => {
      const companyControl = this.userForm.get( 'companyId' );
      if ( role === RolesEnum.COMPANY_ADMIN || role === RolesEnum.COMPANY_USER ) {
        companyControl?.setValidators( [Validators.required] );
      } else {
        companyControl?.clearValidators();
        companyControl?.setValue( '' );
      }
      companyControl?.updateValueAndValidity();
    } );
  }

  private loadUser ( id: number ) {
    this.userService.getUserById( id ).subscribe( {
      next: ( user: UserResponseDto ) => {
        this.userForm.patchValue( {
          name: user.name,
          surname: user.surname,
          secondSurname: user.secondSurname,
          email: user.email,
          role: user.role,
          companyId: user.company?.id ?? '',
        } );
        this.userForm.get( 'email' )?.disable(); // si no quieres que cambie el email
      },
      error: err => console.error( '❌ Error al cargar usuario', err )
    } );
  }

  onSubmit (): void {
    if ( this.userForm.invalid ) return;

    const dto: RegisterUserRequestDto = this.userForm.getRawValue();

    if ( this.isEditMode ) {
      this.userService.updateUserByAdmin( this.userId, dto ).subscribe( {
        next: () => {
          this.snackBar.open( '✅ Usuario actualizado con éxito', 'Cerrar', { duration: 3000 } );
          this.router.navigate( ['/admin/users'] );
        },
        error: err => {
          this.snackBar.open( '❌ Error al actualizar usuario', 'Cerrar', { duration: 3000 } );
          console.error( err );
        },
      } );
    } else {

      this.userService.registerUserByAdmin( dto ).subscribe( {
        next: user => {
          this.registerSuccess = true;
          this.registerError = '';
          this.userForm.reset();
          this.snackBar.open( '✅ Usuario creado con éxito', 'Cerrar', { duration: 3000 } );
          this.router.navigate( ['/admin/users'] );
        },
        error: err => {
          this.registerError = err.error?.message || 'Error al crear el usuario';
          this.registerSuccess = false;
        }
      } );
    }
  }
}
