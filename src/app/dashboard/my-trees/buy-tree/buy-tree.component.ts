import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LandService } from '../../../services/land.service';
import { TreeTypeService } from '../../../services/tree-type.service';
import { TreeTypeResponseDto } from '../../../api/model/treeTypeResponse';
import { MatDialog } from '@angular/material/dialog';
import { LandResponseDto } from '../../../api';
import { ModalService } from '../../../services/modal.service';

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
  selectedLandInfo: LandResponseDto | null = null;   // ⭐ Info panel derecha

  treeTypes: TreeTypeResponseDto[] = [];
  selectedTreeType: TreeTypeResponseDto | null = null;
  selectedTreeTypeInfo: TreeTypeResponseDto | null = null;  // ⭐ Info panel derecha

  defaultTreePrice = 2.0;

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
    private treeTypeService: TreeTypeService,
    private modalService: ModalService
  ) { }

  ngOnInit (): void {
    this.loadLands();
    this.loadTreeTypes();
  }

  // ---------------------------------------------------------------------
  // CARGA DE DATOS
  // ---------------------------------------------------------------------

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

  // ---------------------------------------------------------------------
  // SELECTORES + INFO PANEL
  // ---------------------------------------------------------------------

  onLandSelected ( landId: number ) {
    this.selectedLand = landId;
    this.selectedLandInfo = this.lands.find( l => l.id === landId ) ?? null;
  }

  onTreeSelected ( treeType: TreeTypeResponseDto ) {
    this.selectedTreeType = treeType;
    this.selectedTreeTypeInfo = treeType;
  }

  openLandInfoModal ( land: LandResponseDto ) {
    this.modalService.openLandInfoModal( land );
  }

  openTreeInfoModal ( treeType: TreeTypeResponseDto ) {
    this.modalService.openLandInfoModal( treeType );
  }

  // ---------------------------------------------------------------------
  // GETTERS
  // ---------------------------------------------------------------------

  get selectedLandName (): string {
    return this.lands.find( l => l.id === this.selectedLand )?.name ?? '';
  }

  get totalPrice (): number {
    if ( !this.selectedTreeType ) return 0;

    const id = this.selectedTreeType.id!;
    const price = this.treePrices[id] ?? this.defaultTreePrice;
    return this.quantity * price;
  }

  get unitPrice (): number {
    return this.selectedTreeType
      ? this.treePrices[this.selectedTreeType.id!] ?? this.defaultTreePrice
      : 0;
  }

  // ---------------------------------------------------------------------
  // NAVEGACIÓN
  // ---------------------------------------------------------------------

  nextStep () {
    if ( this.step < 4 ) this.step++;
  }

  prevStep () {
    if ( this.step > 1 ) this.step--;
  }

  // ---------------------------------------------------------------------
  // CANTIDAD
  // ---------------------------------------------------------------------

  increase () { this.quantity++; }
  decrease () { if ( this.quantity > 1 ) this.quantity--; }

  // ---------------------------------------------------------------------
  // COMPRA
  // ---------------------------------------------------------------------

  confirmPurchase () {
    alert(
      `Compra confirmada:
Land: ${this.selectedLandName}
Árbol: ${this.selectedTreeType?.name}
Cantidad: ${this.quantity}
Precio total: ${this.totalPrice} €`
    );
  }
}
