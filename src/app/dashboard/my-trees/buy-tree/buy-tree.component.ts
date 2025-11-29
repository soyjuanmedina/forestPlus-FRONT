import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LandService } from '../../../services/land.service';
import { TreeTypeService } from '../../../services/tree-type.service';
import { LandResponseDto } from '../../../api/model/landResponse';
import { TreeTypeResponseDto } from '../../../api/model/treeTypeResponse';

@Component( {
  selector: 'app-buy-tree',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './buy-tree.component.html',
  styleUrls: ['./buy-tree.component.scss'],
} )
export class BuyTreeComponent implements OnInit {

  step = 1;

  lands: LandResponseDto[] = [];
  selectedLand: number | null = null;

  treeTypes: TreeTypeResponseDto[] = [];
  selectedTree: TreeTypeResponseDto | null = null;
  defaultTreePrice = 2.0;

  // Precios locales por id de árbol
  treePrices: { [key: number]: number | undefined } = {
    1: 2.5,
    2: 3.0,
    3: 4.0,
    4: 2.0,
    5: 1.5,
    6: 5.0,
  };

  quantity = 1;

  constructor (
    private landService: LandService,
    private treeTypeService: TreeTypeService
  ) { }

  ngOnInit (): void {
    this.loadLands();
    this.loadTreeTypes();
  }

  loadLands () {
    this.landService.getAllLands().subscribe( {
      next: lands => this.lands = lands,
      error: err => console.error( 'Error cargando lands:', err )
    } );
  }

  loadTreeTypes () {
    this.treeTypeService.getAllTreeTypes().subscribe( {
      next: treeTypes => this.treeTypes = treeTypes,
      error: err => console.error( 'Error cargando tipos de árbol:', err )
    } );
  }

  get selectedLandName (): string {
    return this.lands.find( l => l.id === this.selectedLand )?.name ?? '';
  }

  nextStep () {
    if ( this.step < 4 ) this.step++;
  }

  prevStep () {
    if ( this.step > 1 ) this.step--;
  }

  // Usamos el precio local
  get totalPrice (): number {
    if ( !this.selectedTree ) return 0;

    const id = this.selectedTree.id!;
    const price = this.treePrices[id] ?? this.defaultTreePrice; // fallback

    return this.quantity * price;
  }

  confirmPurchase () {
    alert(
      `Compra confirmada:
Land: ${this.selectedLandName}
Árbol: ${this.selectedTree?.name}
Cantidad: ${this.quantity}
Precio total: ${this.totalPrice} €`
    );
  }

  increase () { this.quantity++; }
  decrease () { if ( this.quantity > 1 ) this.quantity--; }

  get unitPrice (): number {
    return this.selectedTree
      ? this.treePrices[this.selectedTree.id!] ?? this.defaultTreePrice
      : 0;
  }
}
