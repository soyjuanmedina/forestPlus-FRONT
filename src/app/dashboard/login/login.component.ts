import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component( {
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
} )
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loginError: string | null = null;

  constructor ( private fb: FormBuilder, private authService: AuthService, private router: Router ) {
    this.loginForm = this.fb.group( {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength( 6 )]]
    } );
    this.loginForm.valueChanges.subscribe( () => {
      this.loginError = null;
    } );
  }

  onSubmit () {
    if ( this.loginForm.valid ) {
      const { email, password } = this.loginForm.value;

      this.authService.login( { email, password } ).subscribe( {
        next: ( res ) => {
          // Login exitoso, ir a /home
          console.log( 'Login', );
          if ( this.authService.isLoggedIn() ) {
            this.router.navigateByUrl( '/' ); // Esto redirige al DashboardComponent
          }
        },
        error: ( err ) => {
          console.error( err );
          this.loginError = 'Usuario o contraseña incorrectos';
        }
      } );
    }
  }
}
