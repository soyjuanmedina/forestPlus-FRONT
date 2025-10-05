import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthControllerService, ResetPasswordRequestDto } from '../../api';
import { Observable } from 'rxjs';

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
    private authControllerService: AuthControllerService,
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


    let request$: Observable<any>;

    if ( isUUID ) {
      // Caso: reset por UUID (forgot-password/reset)
      const payload: ResetPasswordRequestDto = { newPassword: newPassword as string };
      request$ = this.authControllerService.resetForgotPassword( this.token, payload );

    } else {
      // Caso: reset con JWT (usuario logueado)
      const payload: ResetPasswordRequestDto = { newPassword: newPassword as string };
      const authHeader = `Bearer ${this.token}`;
      request$ = this.authControllerService.resetPassword( authHeader, payload );
    }
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
