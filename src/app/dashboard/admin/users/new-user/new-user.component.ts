import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { RegisterUserRequestDto } from '../../../../api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyService } from '../../../../services/company.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface RoleOption {
  value: string;
  label: string;
}

@Component( {
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
} )
export class NewUserComponent implements OnInit {
  newUserForm!: FormGroup;
  hidePassword = true;
  roles: RoleOption[] = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'COMPANY_ADMIN', label: 'Administrador de Compañía' },
    { value: 'COMPANY_USER', label: 'Usuario de Compañía' },
  ];
  companies: any[] = [];
  registerSuccess = false;
  registerError = '';

  constructor (
    private fb: FormBuilder,
    private authService: AuthService,
    private companyService: CompanyService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit (): void {
    // Inicializamos el formulario
    this.newUserForm = this.fb.group( {
      name: ['', Validators.required],
      surname: ['', Validators.required],
      secondSurname: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength( 6 )]],
      role: ['', Validators.required],
      companyId: [''],
    } );

    // Cargar compañías
    this.companyService.getAllCompanies().subscribe( {
      next: ( data ) => this.companies = data,
      error: ( err ) => console.error( 'Error cargando compañías', err )
    } );

    // Validación dinámica de campo companyId según el rol
    this.newUserForm.get( 'role' )?.valueChanges.subscribe( role => {
      const companyControl = this.newUserForm.get( 'companyId' );
      if ( role === 'COMPANY_ADMIN' || role === 'COMPANY_USER' ) {
        companyControl?.setValidators( [Validators.required] );
      } else {
        companyControl?.clearValidators();
        companyControl?.setValue( '' );
      }
      companyControl?.updateValueAndValidity();
    } );
  }

  onSubmit (): void {
    if ( this.newUserForm.invalid ) return;

    const dto: RegisterUserRequestDto = {
      ...this.newUserForm.value
    };

    this.authService.register( dto ).subscribe( {
      next: user => {
        this.registerSuccess = true;
        this.registerError = '';
        this.newUserForm.reset();
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
