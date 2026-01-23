import { Component, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ResetPasswordRequestDto } from '../../api';

export enum PasswordMode {
  FORCED = 'FORCED',
  PROFILE = 'PROFILE'
}

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
  mode: PasswordMode = PasswordMode.FORCED;

  resetForm = this.fb.group( {
    currentPassword: [null],
    newPassword: ['', [Validators.required, Validators.minLength( 6 )]],
    confirmPassword: ['', Validators.required]
  } );

  constructor (
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {

    this.token = this.route.snapshot.queryParamMap.get( 'token' );
    const routeMode = this.route.snapshot.data['mode'];

    if ( routeMode === PasswordMode.PROFILE ) {
      this.mode = PasswordMode.PROFILE;
    } else if ( this.token ) {
      this.mode = PasswordMode.FORCED;
    } else {
      this.mode = PasswordMode.PROFILE;
    }

    const currentPasswordControl = this.resetForm.get( 'currentPassword' );

    if ( this.mode === PasswordMode.PROFILE ) {
      currentPasswordControl?.setValidators( Validators.required );
    } else {
      currentPasswordControl?.clearValidators();
    }

    currentPasswordControl?.updateValueAndValidity();
  }

  onCancel () {
    this.router.navigate( ['/profile'] );
  }

  onSubmit () {

    this.successMessage = '';
    this.errorMessage = '';
    if ( this.resetForm.invalid ) return;

    const { currentPassword, newPassword, confirmPassword } = this.resetForm.value;

    if ( newPassword !== confirmPassword ) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if ( this.mode === PasswordMode.PROFILE ) {

      if ( !currentPassword ) {
        this.errorMessage = 'Debes introducir la contraseña actual';
        return;
      }

      const payload: ResetPasswordRequestDto = {
        newPassword: newPassword as string,
        currentPassword: currentPassword as string
      };

      this.authService.resetPassword( payload ).subscribe( {
        next: () => {
          this.successMessage = 'Contraseña cambiada correctamente';
          setTimeout( () => this.router.navigate( ['/profile'] ), 2000 );
        },
        error: err => {
          this.errorMessage = err.error?.message || 'Error al cambiar la contraseña';
        }
      } );

      return;
    }

    if ( !this.token ) {
      this.errorMessage = 'Token inválido o expirado';
      return;
    }

    // Crear payload
    const payload: ResetPasswordRequestDto = { newPassword: newPassword as string };

    // Llamar al método unificado en AuthService
    const request$ = this.authService.resetPassword( payload, this.isUUID( this.token ) ? this.token : undefined );

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

  // Método auxiliar para detectar si el token es UUID
  private isUUID ( token: string ): boolean {
    return token.length === 36 && token.includes( '-' );
  }

}
