import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component( {
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
} )
export class ResetPasswordComponent {
  errorMessage = '';
  successMessage = '';
  token: string | null = null;  // Puede ser JWT o UUID

  resetForm = this.fb.group( {
    newPassword: ['', [Validators.required, Validators.minLength( 6 )]],
    confirmPassword: ['', Validators.required]
  } );

  constructor (
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Detectar token en query param (UUID) o JWT pasado desde login
    this.token = this.route.snapshot.queryParamMap.get( 'token' ) || localStorage.getItem( 'forestPlus_token' );
  }

  onSubmit () {
    if ( this.resetForm.invalid ) return;

    const { newPassword, confirmPassword } = this.resetForm.value;

    if ( newPassword !== confirmPassword ) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if ( !this.token ) {
      this.errorMessage = 'Token inválido o expirado';
      return;
    }

    // Diferenciar endpoints según el tipo de token
    const isUUID = this.token.length === 36 && this.token.includes( '-' );

    const request$ = isUUID
      ? this.authService.resetForgotPassword( this.token!, newPassword as string )
      : this.authService.resetPassword( {
        newPassword: newPassword as string
      } );               // Endpoint: /reset-password con JWT

    request$.subscribe( {
      next: () => {
        this.successMessage = 'Contraseña cambiada correctamente';
        setTimeout( () => this.router.navigate( ['/'] ), 2000 );
      },
      error: ( err: { error: { message: string } } ) => {
        this.errorMessage = err.error?.message || 'Error al cambiar la contraseña';
      }
    } );
  }
}
