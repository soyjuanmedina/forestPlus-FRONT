import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component( {
  selector: 'app-buy-tree',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './buy-tree.component.html',
  styleUrls: ['./buy-tree.component.scss'],
} )
export class BuyTreeComponent {
  quantity = 1;
  mockPrice = 2.5; // Precio ficticio por árbol

  increase () {
    this.quantity++;
  }

  decrease () {
    if ( this.quantity > 1 ) {
      this.quantity--;
    }
  }

  confirmPurchase () {
    alert( `Compra simulada: ${this.quantity} árboles por ${this.quantity * this.mockPrice} €` );
  }
}
