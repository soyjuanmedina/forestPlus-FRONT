import { ChangeDetectorRef, ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoopsService } from '../../services/loops.service';

@Component( {
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
} )
export class CountdownComponent implements OnInit, OnDestroy {
  @Input() targetDate!: Date;

  remaining = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  private intervalId!: number;

  emailForm!: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor ( private cd: ChangeDetectorRef, private fb: FormBuilder, private loopsService: LoopsService ) { }

  ngOnInit (): void {
    this.emailForm = this.fb.group( {
      email: ['', [Validators.required, Validators.email]]
    } );

    this.updateCountdown();
    this.intervalId = window.setInterval( () => {
      this.updateCountdown();
      this.cd.markForCheck(); // <--- le decimos a Angular que hay cambios
    }, 1000 );
  }

  ngOnDestroy (): void {
    clearInterval( this.intervalId );
  }

  get email () {
    return this.emailForm.get( 'email' );
  }

  private updateCountdown (): void {
    const now = new Date().getTime();
    const target = this.targetDate.getTime();
    const diff = Math.max( target - now, 0 );

    const totalSeconds = Math.floor( diff / 1000 );

    this.remaining.days = Math.floor( totalSeconds / 86400 );
    this.remaining.hours = Math.floor( ( totalSeconds % 86400 ) / 3600 );
    this.remaining.minutes = Math.floor( ( totalSeconds % 3600 ) / 60 );
    this.remaining.seconds = totalSeconds % 60;
  }

  onSubmit (): void {
    this.submitted = true;
    this.errorMessage = '';

    if ( this.emailForm.invalid ) {
      return;
    }

    const email = this.emailForm.value.email;
    this.loopsService.registerEmail( this.emailForm.value.email )
      .subscribe( {
        next: ( success ) => {
          if ( success ) {
            this.successMessage = '¡Gracias! Te avisaremos cuando la app esté disponible.';
            this.emailForm.reset();
            this.submitted = false;
          } else {
            this.errorMessage = 'No se pudo registrar tu email, inténtalo de nuevo.';
          }
        },
        error: () => {
          this.errorMessage = 'Ocurrió un error, inténtalo más tarde.';
        }
      } );
  }
}
