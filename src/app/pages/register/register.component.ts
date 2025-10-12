import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { ROLES, RolesEnum } from '../../core/constants/roles';

@Component( {
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
} )
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  registerError: string = '';
  registerSuccess: boolean = false;
  roles = ROLES;

  constructor ( private fb: FormBuilder, private authService: AuthService ) {
    this.registerForm = this.fb.group( {
      name: ['', Validators.required],
      surname: [''],
      secondSurname: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength( 6 )]],
      role: [RolesEnum.USER]
    } );
  }

  onSubmit () {
    if ( this.registerForm.invalid ) return;

    this.registerError = '';
    this.registerSuccess = false;

    this.authService.register( this.registerForm.value ).subscribe( {
      next: () => {
        this.registerSuccess = true; // mostrar mensaje de éxito
        this.registerForm.reset();   // opcional: limpiar el formulario
      },
      error: ( err: { error: { message: string; }; } ) => this.registerError = err.error?.message || 'Error al registrarse'
    } );
  }
}
