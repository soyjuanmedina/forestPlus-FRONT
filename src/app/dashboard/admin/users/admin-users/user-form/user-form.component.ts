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
import { ROLES, RolesEnum } from '../../../../../models/roles';
import { MatIconModule } from '@angular/material/icon';

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
  currentUserRole: string | null = '';
  selectedFile?: File;
  previewImage?: string;
  user?: UserResponseDto;

  RolesEnum = RolesEnum;

  constructor (
    private fb: FormBuilder,
    private userService: UserService,
    private companyService: CompanyService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit (): void {
    this.currentUserRole = this.userService.getCurrentUser()?.role ?? null;

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
      next: data => this.companies = data,
      error: err => console.error( 'Error cargando compañías', err )
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
        this.user = user;
        this.previewImage = user.picture;
        this.userForm.patchValue( {
          name: user.name,
          surname: user.surname,
          secondSurname: user.secondSurname,
          email: user.email,
          role: user.role,
          companyId: user.company?.id ?? '',
        } );
        this.userForm.get( 'email' )?.disable();
        if ( this.isEditMode &&
          this.userService.getCurrentUser()?.role === RolesEnum.COMPANY_ADMIN &&
          this.userService.getCurrentUser()?.id === this.userId ) {
          this.userForm.get( 'role' )?.disable();
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
      reader.onload = () => this.previewImage = reader.result as string;
      reader.readAsDataURL( file );
    }
  }

  onSubmit (): void {
    if ( this.userForm.invalid ) return;

    const dto: RegisterUserRequestDto = this.userForm.getRawValue();

    // Subida de imagen + datos
    const update$ = this.selectedFile && this.isEditMode
      ? this.userService.updateUserPicture( this.userId, this.selectedFile )
      : this.isEditMode
        ? this.userService.updateUserByAdmin( this.userId, dto )
        : this.userService.registerUserByAdmin( dto );

    update$.subscribe( {
      next: ( updatedUser: UserResponseDto ) => {
        if ( this.isEditMode ) {
          // Si había otros cambios además de la foto
          if ( !this.selectedFile ) {
            this.finalizeUpdate( updatedUser );
          } else if ( dto.name || dto.surname || dto.secondSurname || dto.email ) {
            this.userService.updateUserByAdmin( this.userId, dto ).subscribe( userUpdated => {
              this.finalizeUpdate( userUpdated );
            } );
          } else {
            this.finalizeUpdate( updatedUser );
          }
        } else {
          this.registerSuccess = true;
          this.registerError = '';
          this.userForm.reset();
          this.snackBar.open( '✅ Usuario creado con éxito', 'Cerrar', { duration: 3000 } );
          this.router.navigate( ['/admin/users'] );
        }
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
    this.isEditMode = false;
    this.snackBar.open( '✅ Usuario actualizado con éxito', 'Cerrar', { duration: 3000 } );
    this.router.navigate( ['/admin/users'] );
  }
}
