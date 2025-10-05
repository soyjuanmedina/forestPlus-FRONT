import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserResponse } from '../../models/user.response';
import { UserService } from '../../services/user.service';

@Component( {
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
} )
export class HomeComponent implements OnInit {
  userName: string = '';

  constructor ( private userService: UserService ) { }

  ngOnInit (): void {
    this.userService.getUser().subscribe( ( user: UserResponse | null ) => {
      this.userName = user?.name || '';
    } );
  }
}
