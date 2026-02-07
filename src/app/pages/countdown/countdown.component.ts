import { ChangeDetectorRef, ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component( {
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
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

  constructor ( private cd: ChangeDetectorRef ) { }

  ngOnInit (): void {
    this.updateCountdown();
    this.intervalId = window.setInterval( () => {
      this.updateCountdown();
      this.cd.markForCheck(); // <--- le decimos a Angular que hay cambios
    }, 1000 );
  }

  ngOnDestroy (): void {
    clearInterval( this.intervalId );
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
}
