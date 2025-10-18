import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { CompanyResponseDto } from '../../../../api/model/companyResponse';
import { UserService } from '../../../../services/user.service';
import { RolesEnum } from '../../../../models/roles';
import { CompanyService } from '../../../../services/company.service';

@Component( {
  selector: 'app-admin-companies',
  standalone: true,
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule
  ]
} )
export class AdminCompaniesComponent implements OnInit {
  companies = new MatTableDataSource<CompanyResponseDto>();
  displayedColumns: string[] = ['name', 'address', 'actions'];

  @ViewChild( MatPaginator ) paginator!: MatPaginator;
  @ViewChild( MatSort ) sort!: MatSort;

  constructor (
    private companyService: CompanyService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit (): void {
    this.loadCompanies();
  }

  ngAfterViewInit (): void {
    this.companies.paginator = this.paginator;
    this.companies.sort = this.sort;
  }

  loadCompanies (): void {
    const currentUser = this.userService.getCurrentUser();

    this.companyService.getAllCompanies().subscribe( {
      next: ( data ) => {
        let filteredData = data;

        // 👉 Si es COMPANY_ADMIN, filtrar solo su compañía
        if ( currentUser?.role === RolesEnum.COMPANY_ADMIN && currentUser.company?.id ) {
          filteredData = data.filter( c => c.id === currentUser.company?.id );
        }

        this.companies.data = filteredData;

        if ( this.paginator ) {
          this.paginator.length = filteredData.length;
        }
      },
      error: ( err ) => {
        console.error( '❌ Error al cargar compañías', err );
      }
    } );
  }

  onEdit ( company: CompanyResponseDto ): void {
    this.router.navigate( ['/admin/company-form/', company.id] );
  }

  onDelete ( company: CompanyResponseDto ): void {

    const companyId = company.id;
    if ( !companyId ) {
      console.warn( '⚠️ No se puede eliminar: id de compañía undefined' );
      this.snackBar.open( '⚠️ No se puede eliminar esta compañía', 'Cerrar', { duration: 3000 } );
      return;
    }
    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar compañía',
        message: `¿Estás seguro de que quieres eliminar ${company.name}?`
      }
    } );

    dialogRef.afterClosed().subscribe( result => {
      if ( result ) {
        this.companyService.deleteCompany( companyId ).subscribe( {
          next: () => {
            this.snackBar.open( '✅ Compañía eliminada', 'Cerrar', { duration: 3000 } );
            this.loadCompanies();
          },
          error: ( err ) => {
            console.error( 'Error al eliminar compañía', err );
            this.snackBar.open( '❌ Error al eliminar compañía', 'Cerrar', { duration: 3000 } );
          }
        } );
      }
    } );
  }

  applyFilter ( event: Event ): void {
    const filterValue = ( event.target as HTMLInputElement ).value;
    this.companies.filter = filterValue.trim().toLowerCase();
  }
}
