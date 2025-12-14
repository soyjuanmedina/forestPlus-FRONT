import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component( {
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
} )
export class LoginComponent {
  loginForm: FormGroup;
  forgotForm: FormGroup;
  hidePassword = true;
  loginError: string | null = null;
  showResendButton: boolean = false;
  unverifiedEmail: string | null = null;
  success = false;
  forgotMode = false;
  accessGranted = true;
  accessKey = '';
  error = false;


  constructor (
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group( {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength( 6 )]]
    } );

    this.forgotForm = this.fb.group( {
      email: ['', [Validators.required, Validators.email]]
    } );

    this.loginForm.valueChanges.subscribe( () => this.loginError = null );

  }

  toggleForgotMode () {
    this.forgotMode = !this.forgotMode;
    this.success = false;
    this.loginError = null;
  }

  onSubmit () {
    if ( this.forgotMode ) {
      this.onForgotSubmit();
      return;
    }

    if ( this.loginForm.valid ) {
      const { email, password } = this.loginForm.value;

      this.authService.login( { email, password } ).subscribe( {
        next: user => {
          if ( !user ) return;

          if ( user.forcePasswordChange ) {
            this.router.navigate( ['/reset-password'], { queryParams: { email: user.email } } );
          } else {
            this.router.navigateByUrl( '/' ); // ahora sí funcionará
          }
        },
        error: err => this.handleLoginError( err )
      } );
    }
  }


  private handleLoginError ( err: any ) {
    console.error( err );
    const backendMessage = err.error?.message || 'LOGIN.GENERIC_ERROR';

    if ( backendMessage === 'EMAIL_NOT_VERIFIED' ) {
      this.loginError = this.translate.instant( 'LOGIN.EMAIL_NOT_VERIFIED' );
      this.showResendButton = true;
      this.unverifiedEmail = this.loginForm.value.email;
    } else {
      this.translate.get( backendMessage ).subscribe( translated => {
        this.loginError = translated;
        this.showResendButton = false;
      } );
    }
  }

  resendVerificationEmail () {
    if ( !this.unverifiedEmail ) return;

    this.authService.resendVerification( this.unverifiedEmail ).subscribe( {
      next: () => {
        this.loginError = this.translate.instant( 'LOGIN.VERIFICATION_EMAIL_SENT' );
        this.showResendButton = false;
      },
      error: () => {
        this.loginError = this.translate.instant( 'LOGIN.VERIFICATION_EMAIL_FAILED' );
      }
    } );
  }

  onForgotSubmit () {
    if ( this.forgotForm.invalid ) return;

    const email = this.forgotForm.value.email;
    this.authService.forgotPassword( email )
      .pipe( finalize( () => { } ) ) // el spinner global ya se encarga
      .subscribe( {
        next: () => {
          this.success = true;
        },
        error: ( err ) => {
          alert( err?.error?.message || 'Error enviando correo de restablecimiento' );
        }
      } );
  }
}
