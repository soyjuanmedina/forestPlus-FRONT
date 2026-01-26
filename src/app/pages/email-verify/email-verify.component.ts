import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';

@Component( {
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  selector: 'app-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrls: ['./email-verify.component.scss']
} )
export class EmailVerifyComponent implements OnInit {

  loading = true;
  success = false;
  errorMessage: string | null = null;

  constructor ( private route: ActivatedRoute, private authService: AuthService, private translate: TranslateService ) { }

  ngOnInit (): void {
    this.route.queryParams.subscribe( params => {
      const uuid = params['uuid'];
      if ( uuid ) {
        this.authService.verifyEmail( uuid ).subscribe( {
          next: () => {
            this.success = true;
            this.loading = false;
          },
          error: ( err: any ) => {
            console.error( err );
            this.success = false;
            this.loading = false;

            const messageKey = err?.error?.message || 'VERIFY_EMAIL.ERROR';
            this.translate.get( messageKey ).subscribe( translated => this.errorMessage = translated );
          }
        } );
      } else {
        // No hay UUID, mostrar error directamente
        this.loading = false;
        this.success = false;

        this.translate.get( 'VERIFY_EMAIL.INVALID_LINK' ).subscribe( translated => {
          this.errorMessage = translated;
        } );
      }
    } );
  }
}
