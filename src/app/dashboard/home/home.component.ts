import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { UserResponseDto } from '../../api';

@Component( {
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
} )
export class HomeComponent implements OnInit {
  userName: string = '';

  constructor ( private userService: UserService ) { }

  ngOnInit (): void {
    // Nos suscribimos al BehaviorSubject del usuario actual
    this.userService.user$.subscribe( ( user: UserResponseDto | null ) => {
      if ( user ) {
        this.userName = user.name;

        // Aquí puedes cargar datos adicionales de la compañía si hace falta,
        // pero solo cuando el usuario ya está definido y hay token
        // Ejemplo:
        // this.userService.getCompany(user.company.id).subscribe(...)
      }
    } );
  }
}
