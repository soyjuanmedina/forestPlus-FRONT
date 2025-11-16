import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component( {
  selector: 'app-admin-page',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
} )
export class AdminPageComponent {

}
