import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/user.response';

@Component( {
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  styleUrls: ['./profile.component.scss']
} )
export class ProfileComponent implements OnInit {
  @Input() user?: UserResponse;

  constructor ( private userService: UserService ) { }

  ngOnInit (): void {
    this.userService.getUser().subscribe( u => this.user = u ?? undefined );
  }
}
