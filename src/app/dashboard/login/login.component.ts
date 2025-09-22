import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
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
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
} )
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor ( private fb: FormBuilder, private authService: AuthService, private router: Router ) {
    this.loginForm = this.fb.group( {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength( 6 )]]
    } );
  }

  onSubmit () {
    if ( this.loginForm.valid ) {
      const { email, password } = this.loginForm.value;
      // Simulación de login
      this.authService.login( { email } ); // podrías incluir token real aquí
      this.router.navigate( ['/home'] );
    }
  }
}
