import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LandInfoModalComponent } from '../modals/land-info-modal/land-info-modal.component';
import { TreeTypeInfoModalComponent } from '../modals/tree-type-info-modal/tree-type-info-modal.component';

@Injectable( { providedIn: 'root' } )
export class ModalService {
  constructor ( private dialog: MatDialog ) { }

  openLandInfoModal ( land: any ) {
    return this.dialog.open( LandInfoModalComponent, {
      width: '450px',
      data: { land }
    } );
  }

  openTreeTypeInfoModal ( tree: any ) {
    return this.dialog.open( TreeTypeInfoModalComponent, {
      width: '450px',
      data: { tree }
    } );
  }
}