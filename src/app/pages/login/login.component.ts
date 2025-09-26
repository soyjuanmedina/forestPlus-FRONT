import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component( {
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
} )
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loginError: string | null = null;
  showResendButton: boolean = false;
  unverifiedEmail: string | null = null;

  constructor ( private fb: FormBuilder, private authService: AuthService, private router: Router, private translate: TranslateService ) {
    this.loginForm = this.fb.group( {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength( 6 )]]
    } );
    this.loginForm.valueChanges.subscribe( () => {
      this.loginError = null;
    } );
  }

  resendVerificationEmail () {
    if ( !this.unverifiedEmail ) return;

    this.authService.resendVerificationEmail( { email: this.unverifiedEmail } ).subscribe( {
      next: () => {
        this.loginError = this.translate.instant( 'LOGIN.VERIFICATION_EMAIL_SENT' );
        this.showResendButton = false;
      },
      error: ( err ) => {
        this.loginError = this.translate.instant( 'LOGIN.VERIFICATION_EMAIL_FAILED' );
      }
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
          const backendMessage = err.error?.message || 'LOGIN.GENERIC_ERROR';

          if ( backendMessage === 'EMAIL_NOT_VERIFIED' ) {
            // Mostrar mensaje con botón
            this.loginError = this.translate.instant( 'LOGIN.EMAIL_NOT_VERIFIED' );
            this.showResendButton = true;
            this.unverifiedEmail = this.loginForm.value.email; // Guardar email
          } else {
            // Mensajes normales
            this.translate.get( backendMessage ).subscribe( translated => {
              this.loginError = translated;
              this.showResendButton = false;
            } );
          }
        }
      } );
    }
  }
}
