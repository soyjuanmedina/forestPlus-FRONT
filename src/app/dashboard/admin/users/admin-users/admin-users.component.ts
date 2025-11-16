import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserResponseDto } from '../../../../api/model/userResponse';
import { UserService } from '../../../../services/user.service';
import { RolesEnum } from '../../../../models/roles';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component( {
  selector: 'app-admin-users',
  standalone: true,
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ]
} )
export class AdminUsersComponent implements OnInit {
  users: UserResponseDto[] = [];
  filteredUsers: UserResponseDto[] = [];

  currentPage = 0;
  pageSize = 10;
  totalPages = 1;

  filterText = '';

  constructor (
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit (): void {
    this.loadUsers();
  }

  loadUsers (): void {
    const currentUser = this.userService.getCurrentUser();
    const companyIdFilter =
      currentUser?.role === RolesEnum.COMPANY_ADMIN
        ? currentUser.company?.id
        : undefined;

    this.userService.getUsers( 0, 1000, 'id,asc', undefined, companyIdFilter ).subscribe( {
      next: ( data ) => {
        const allUsers = ( data.content ?? [] ).filter( ( u ) => u.id !== currentUser?.id );
        this.users = allUsers;
        this.applyFilter();
      },
      error: ( err ) => console.error( '❌ Error al cargar usuarios', err )
    } );
  }

  applyFilter (): void {
    const filter = this.filterText.trim().toLowerCase();
    this.filteredUsers = this.users.filter(
      ( u ) =>
        ( u.name || '' ).toLowerCase().includes( filter ) ||
        ( u.surname || '' ).toLowerCase().includes( filter ) ||
        ( u.email || '' ).toLowerCase().includes( filter )
    );

    this.currentPage = 0;
    this.totalPages = Math.ceil( this.filteredUsers.length / this.pageSize );
  }

  getPagedUsers (): UserResponseDto[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredUsers.slice( start, start + this.pageSize );
  }

  previousPage (): void {
    if ( this.currentPage > 0 ) this.currentPage--;
  }

  nextPage (): void {
    if ( this.currentPage + 1 < this.totalPages ) this.currentPage++;
  }

  addUser (): void {
    this.router.navigate( ['/admin/user-form'] );
  }

  onEdit ( user: UserResponseDto ): void {
    this.router.navigate( ['/admin/user-form', user.id] );
  }

  onView ( user: UserResponseDto ): void {
    this.router.navigate( ['/profile', user.id] );
  }

  onDelete ( user: UserResponseDto ): void {
    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant( 'ADMIN_USERS.CONFIRM_DELETE_USER.TITLE' ),
        message: this.translate.instant( 'ADMIN_USERS.CONFIRM_DELETE_USER.MESSAGE', { name: user.name } )
      }
    } );

    dialogRef.afterClosed().subscribe( ( result ) => {
      if ( result ) {
        this.userService.deleteUser( user.id ).subscribe( {
          next: () => {
            this.snackBar.open(
              this.translate.instant( 'ADMIN_USERS.USER_DELETED' ),
              this.translate.instant( 'COMMON.CLOSE' ),
              { duration: 3000 }
            );
            this.loadUsers();
          },
          error: ( err ) => {
            console.error( '❌ Error al eliminar usuario', err );
            this.snackBar.open(
              this.translate.instant( 'ADMIN_USERS.USER_DELETE_ERROR' ),
              this.translate.instant( 'COMMON.CLOSE' ),
              { duration: 3000 }
            );
          }
        } );
      }
    } );
  }
}
