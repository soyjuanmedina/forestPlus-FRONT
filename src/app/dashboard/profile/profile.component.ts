import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UserResponseDto } from '../../api';
import { UserService } from '../../services/user.service';

@Component( {
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
} )
export class ProfileComponent implements OnInit {
  @Input() user?: UserResponseDto;

  constructor ( private userService: UserService ) { }

  ngOnInit (): void {
    this.userService.getUser().subscribe( u => this.user = u ?? undefined );
  }
}
