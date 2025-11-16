import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { CompanyResponseDto } from '../../../../api/model/companyResponse';
import { UserService } from '../../../../services/user.service';
import { RolesEnum } from '../../../../models/roles';
import { CompanyService } from '../../../../services/company.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component( {
  selector: 'app-admin-companies',
  standalone: true,
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss'],
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, FormsModule, TranslateModule]
} )
export class AdminCompaniesComponent implements OnInit {
  companies: CompanyResponseDto[] = [];
  filteredCompanies: CompanyResponseDto[] = [];

  currentPage = 0;
  pageSize = 5;
  totalPages = 1;

  filterText = '';

  constructor (
    private companyService: CompanyService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit (): void {
    this.loadCompanies();
  }

  loadCompanies (): void {
    const currentUser = this.userService.getCurrentUser();

    this.companyService.getAllCompanies().subscribe( {
      next: ( data ) => {
        if ( currentUser?.role === RolesEnum.COMPANY_ADMIN && currentUser.company?.id != null ) {
          const companyId = currentUser.company.id;
          this.companies = data.filter( c => c.id === companyId );
        } else {
          this.companies = data;
        }

        this.applyFilter();
      },
      error: ( err ) => console.error( '❌ Error al cargar compañías', err )
    } );
  }

  applyFilter (): void {
    const filter = this.filterText.trim().toLowerCase();
    this.filteredCompanies = this.companies.filter( c =>
      ( c.name || '' ).toLowerCase().includes( filter ) ||
      ( c.address || '' ).toLowerCase().includes( filter )
    );

    this.currentPage = 0;
    this.totalPages = Math.ceil( this.filteredCompanies.length / this.pageSize );
  }

  getPagedCompanies (): CompanyResponseDto[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredCompanies.slice( start, start + this.pageSize );
  }

  previousPage (): void {
    if ( this.currentPage > 0 ) this.currentPage--;
  }

  nextPage (): void {
    if ( this.currentPage + 1 < this.totalPages ) this.currentPage++;
  }

  addCompany (): void {
    this.router.navigate( ['/admin/company-form'] );
  }

  onEdit ( company: CompanyResponseDto ): void {
    this.router.navigate( ['/admin/company-form', company.id] );
  }

  onView ( company: CompanyResponseDto ): void {
    this.router.navigate( ['/company', company.id] );
  }

  onDelete ( company: CompanyResponseDto ): void {
    if ( !company.id ) return;

    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant( 'ADMIN_COMPANIES.CONFIRM_DELETE_COMPANY.TITLE' ),
        message: this.translate.instant( 'ADMIN_COMPANIES.CONFIRM_DELETE_COMPANY.MESSAGE', { name: company.name } )
      }
    } );

    dialogRef.afterClosed().subscribe( result => {
      if ( result && company.id !== undefined ) {
        this.companyService.deleteCompany( company.id ).subscribe( {
          next: () => {
            this.snackBar.open(
              this.translate.instant( 'ADMIN_COMPANIES.COMPANY_DELETED' ),
              this.translate.instant( 'COMMON.CLOSE' ),
              { duration: 3000 }
            );
            this.loadCompanies();
          },
          error: ( err ) => {
            console.error( 'Error al eliminar compañía', err );
            this.snackBar.open(
              this.translate.instant( 'ADMIN_COMPANIES.COMPANY_DELETE_ERROR' ),
              this.translate.instant( 'COMMON.CLOSE' ),
              { duration: 3000 }
            );
          }
        } );
      }
    } );
  }
}
