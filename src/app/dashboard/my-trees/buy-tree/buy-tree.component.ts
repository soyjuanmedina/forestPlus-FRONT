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
import { LandResponseDto, OrderRequestDto, OrderResponseDto, PurchaseRequestDto, RedsysPaymentResponseDto } from '../../../api';
import { ModalService } from '../../../services/modal.service';
import { PurchaseService } from '../../../services/purchase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { RedsysPaymentService } from '../../../services/redsys-payment.service';
import { OrdersService } from '../../../services/orders.service';
import { UserService } from '../../../services/user.service';

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
    7: 10
  };

  quantity = 1;

  constructor (
    private landService: LandService,
    private treeTypeService: TreeTypeService,
    private modalService: ModalService,
    private purchaseService: PurchaseService,
    private redsysPaymentService: RedsysPaymentService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ordersService: OrdersService,
    private userService: UserService
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
    this.selectedTreeType = this.treeTypes.find( t => t.id === 7 )!;
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
    if ( !this.selectedLand || !this.selectedTreeType ) return;

    const request: PurchaseRequestDto = {
      landId: this.selectedLand,
      treeTypeId: this.selectedTreeType.id!,
      quantity: this.quantity,
      pricePerUnit: this.unitPrice
    };

    this.purchaseService.purchaseTrees( request ).subscribe( {
      next: ( res ) => {
        // Mostrar notificación de éxito
        this.router.navigate( ['/home'] );
        this.snackBar.open(
          `Compra confirmada: ${this.selectedTreeType?.name} x${this.quantity}`,
          'Cerrar',
          { duration: 5000, panelClass: ['bg-green-600', 'text-white'] }
        );

        // Opcional: resetear pasos o variables si quieres
        this.step = 1;
        this.selectedLand = null;
        this.selectedLandInfo = null;
        this.selectedTreeType = null;
        this.selectedTreeTypeInfo = null;
        this.quantity = 1;
      },
      error: ( err ) => {
        console.error( 'Error al realizar la compra', err );
        this.snackBar.open(
          `Error al confirmar la compra`,
          'Cerrar',
          { duration: 5000, panelClass: ['bg-red-600', 'text-white'] }
        );
      }
    } );

    /* 
REDSYS
    const user = this.userService.getCurrentUser();

    // 1️⃣ Crear la orden en el backend
    const orderRequest: OrderRequestDto = {
      userId: user?.id!,
      companyId: user?.company?.id ?? undefined,
      totalAmount: this.totalPrice
    };

    this.ordersService.createOrder( orderRequest ).subscribe( {
      next: ( orderRes: OrderResponseDto ) => {
        // 2️⃣ Una vez creado el pedido, usamos su ID numérico para Redsys
        const orderId = orderRes.id;
        if ( !orderId ) {
          console.error( "No se pudo crear el pago porque orderId es undefined" );
          return;
        }

        this.redsysPaymentService.createPayment( orderId ).subscribe( {
          next: ( paymentRes: RedsysPaymentResponseDto ) => {
            // 3️⃣ Redirigimos al usuario al formulario de Redsys

            this.redsysPaymentService.sendToRedsys( paymentRes );
          },
          error: ( err ) => {
            console.error( 'Error creating Redsys payment', err );
            this.snackBar.open( 'Error initiating payment', 'Close', {
              duration: 5000,
              panelClass: ['bg-red-600', 'text-white']
            } );
          }
        } );
      },
      error: ( err ) => {
        console.error( 'Error creating order', err );
        this.snackBar.open( 'Error creating order', 'Close', {
          duration: 5000,
          panelClass: ['bg-red-600', 'text-white']
        } );
      }
    } ); */
  }
}
